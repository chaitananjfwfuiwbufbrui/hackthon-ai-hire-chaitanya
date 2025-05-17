import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any
import os
import sqlite3
import json
from .llm_utils import call_groq

class SearchEngine:
    def __init__(self, db_path: str = "data/resumes.db"):
        self.db_path = db_path
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        # Ensure data directory exists
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self._init_db()

    def _init_db(self):
        """Initialize the database with the required schema."""
        try:
            conn = sqlite3.connect(self.db_path)
            c = conn.cursor()
            
            # Create table if it doesn't exist
            c.execute("""
                CREATE TABLE IF NOT EXISTS resumes (
                    id INTEGER PRIMARY KEY,
                    name TEXT,
                    skills TEXT,
                    experience TEXT,
                    education TEXT,
                    contact TEXT,
                    summary TEXT,
                    embedding TEXT,
                    created_at TEXT
                )
            """)
            conn.commit()
            conn.close()
            print("Database initialized successfully")
        except Exception as e:
            print(f"Error initializing database: {str(e)}")
            raise

    def store_resume(self, resume_data: Dict[str, Any]) -> int:
        """Store resume with its embedding in the database."""
        try:
            # Create a more comprehensive text blob for embedding
            text_parts = [
                resume_data.get('summary', ''),
                ' '.join(resume_data.get('skills', [])),
                resume_data.get('experience', ''),
                resume_data.get('education', ''),
                ' '.join(str(v) for v in resume_data.get('contact', {}).values())
            ]
            text_blob = ' '.join(filter(None, text_parts))
            print(f"Creating embedding for resume: {resume_data.get('name')}")
            print(f"Text blob: {text_blob[:200]}...")  # Print first 200 chars for debugging
            
            # Generate and validate embedding
            embedding = self.model.encode(text_blob)
            if embedding is None or len(embedding) == 0:
                raise ValueError("Failed to generate embedding")
            
            embedding_list = embedding.tolist()
            print(f"Generated embedding of length: {len(embedding_list)}")

            # Validate the embedding before storing
            if not isinstance(embedding_list, list) or len(embedding_list) == 0:
                raise ValueError("Invalid embedding format")

            conn = sqlite3.connect(self.db_path)
            c = conn.cursor()
            
            # First, check if resume already exists
            c.execute("SELECT id FROM resumes WHERE name = ?", (resume_data["name"],))
            existing = c.fetchone()
            
            if existing:
                # Update existing resume
                c.execute("""
                    UPDATE resumes 
                    SET skills = ?, experience = ?, education = ?, contact = ?, 
                        summary = ?, embedding = ?, created_at = ?
                    WHERE name = ?
                """, (
                    json.dumps(resume_data["skills"]),
                    resume_data["experience"],
                    resume_data.get("education"),
                    json.dumps(resume_data.get("contact", {})),
                    resume_data.get("summary"),
                    json.dumps(embedding_list),
                    resume_data.get("created_at"),
                    resume_data["name"]
                ))
                resume_id = existing[0]
            else:
                # Insert new resume
                c.execute("""
                    INSERT INTO resumes (
                        name, skills, experience, education, contact, summary, embedding, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    resume_data["name"],
                    json.dumps(resume_data["skills"]),
                    resume_data["experience"],
                    resume_data.get("education"),
                    json.dumps(resume_data.get("contact", {})),
                    resume_data.get("summary"),
                    json.dumps(embedding_list),
                    resume_data.get("created_at")
                ))
                resume_id = c.lastrowid
            
            conn.commit()
            
            # Verify the embedding was stored correctly
            c.execute("SELECT embedding FROM resumes WHERE id = ?", (resume_id,))
            stored_embedding = c.fetchone()
            if not stored_embedding or not stored_embedding[0]:
                raise ValueError("Failed to store embedding")
                
            conn.close()
            print(f"Successfully stored resume with ID: {resume_id}")
            return resume_id
        except Exception as e:
            print(f"Error storing resume: {str(e)}")
            raise

    def semantic_search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Perform semantic search on resumes."""
        try:
            print(f"Starting semantic search for query: {query}")
            # Create a more comprehensive query embedding
            query_embedding = self.model.encode(query)
            conn = sqlite3.connect(self.db_path)
            c = conn.cursor()

            # Get all resumes with valid embeddings
            c.execute("""
                SELECT id, name, skills, experience, education, contact, summary, embedding 
                FROM resumes 
                WHERE embedding IS NOT NULL
            """)
            rows = c.fetchall()
            print(f"Found {len(rows)} resumes with valid embeddings")

            if not rows:
                print("No resumes found with valid embeddings")
                return []

            similarities = []
            for row in rows:
                try:
                    resume_id, name, skills, experience, education, contact, summary, emb_json = row
                    if not emb_json:  # Skip if embedding is NULL
                        print(f"Skipping resume {resume_id} due to NULL embedding")
                        continue
                        
                    resume_embedding = np.array(json.loads(emb_json))
                    
                    # Calculate cosine similarity
                    similarity = np.dot(query_embedding, resume_embedding) / (
                        np.linalg.norm(query_embedding) * np.linalg.norm(resume_embedding)
                    )
                    
                    # Add a small boost for exact matches in skills or summary
                    if isinstance(skills, str):
                        skills_list = json.loads(skills)
                    else:
                        skills_list = skills
                        
                    # Check for keyword matches
                    query_keywords = query.lower().split()
                    skills_text = ' '.join(skills_list).lower()
                    summary_text = summary.lower() if summary else ""
                    
                    # Print matching information
                    print(f"\nResume {resume_id} ({name}):")
                    print(f"Skills: {skills_text}")
                    print(f"Summary: {summary_text}")
                    print(f"Query keywords: {query_keywords}")
                    
                    if any(keyword in skills_text for keyword in query_keywords):
                        print(f"Found keyword match in skills for resume {resume_id}")
                        similarity += 0.1
                        
                    if summary and any(keyword in summary_text for keyword in query_keywords):
                        print(f"Found keyword match in summary for resume {resume_id}")
                        similarity += 0.1
                    
                    print(f"Final similarity score: {similarity}")
                    similarities.append((similarity, resume_id))
                except (json.JSONDecodeError, TypeError) as e:
                    print(f"Error processing resume {resume_id}: {str(e)}")
                    continue

            if not similarities:
                print("No similarities calculated")
                return []

            # Get top matches
            top_matches = sorted(similarities, reverse=True)[:top_k]
            print(f"\nTop matches: {top_matches}")
            matched_ids = [match[1] for match in top_matches]

            # Fetch full resume data for matches
            placeholders = ",".join(["?"] * len(matched_ids))
            c.execute(f"""
                SELECT id, name, skills, experience, education, contact, summary 
                FROM resumes 
                WHERE id IN ({placeholders})
            """, matched_ids)
            
            results = []
            for row in c.fetchall():
                try:
                    # Find the similarity score for this resume
                    similarity_score = next((score for score, rid in top_matches if rid == row[0]), 0)
                    
                    results.append({
                        "id": row[0],
                        "name": row[1],
                        "skills": json.loads(row[2]) if row[2] else [],
                        "experience": row[3] or "",
                        "education": row[4] or "",
                        "contact": json.loads(row[5]) if row[5] else {},
                        "summary": row[6] or "",
                        "similarity_score": similarity_score
                    })
                except json.JSONDecodeError as e:
                    print(f"Error parsing JSON for resume {row[0]}: {str(e)}")
                    continue
            
            conn.close()
            print(f"Returning {len(results)} results")
            return results
        except Exception as e:
            print(f"Error in semantic search: {str(e)}")
            return []

    def generate_answer_with_rag(self, query: str, top_resumes: List[Dict[str, Any]]) -> str:
        """Generate a response using RAG with the top matching resumes."""
        if not top_resumes:
            return "No matching resumes found."
            
        context = "\n\n".join([
            f"Name: {r['name']}\n"
            f"Skills: {', '.join(r['skills'])}\n"
            f"Experience: {r['experience']}\n"
            f"Education: {r['education']}\n"
            f"Summary: {r['summary']}"
            for r in top_resumes
        ])
        
        prompt = f"""You are a helpful assistant helping recruiters find suitable candidates.
        
        User query: "{query}"

        Resume database (top matches):
        {context}

        Based on the above, which resumes are the best matches? Provide reasoning for each match.
        Format your response as:
        1. Best matches (with reasoning)
        2. Why they match the requirements
        3. Any potential concerns or missing qualifications
        """
        
        try:
            response, _ = call_groq(prompt)
            return response
        except Exception as e:
            print(f"Error generating RAG response: {str(e)}")
            return "Error generating analysis. Please try again."

    def search(self, query: str, location: str = None, experience_years: int = None) -> Dict[str, Any]:
        """Main search function that combines semantic search with RAG."""
        try:
            print(f"\nStarting search for query: {query}")
            # Perform semantic search
            top_resumes = self.semantic_search(query, top_k=5)  # Limit to top 5 matches
            print(f"Found {len(top_resumes)} matching resumes")
            
            if not top_resumes:
                print("No matches found")
                return {
                    "matches": [],
                    "analysis": "No matching resumes found for your query."
                }
            
            # Sort matches by similarity score
            sorted_matches = sorted(top_resumes, key=lambda x: x.get('similarity_score', 0), reverse=True)
            
            # Generate RAG response
            rag_response = self.generate_answer_with_rag(query, sorted_matches)
            
            return {
                "matches": sorted_matches,
                "analysis": rag_response
            }
        except Exception as e:
            print(f"Error in search: {str(e)}")
            return {
                "matches": [],
                "analysis": f"Error performing search: {str(e)}"
            }

    def clear_index(self):
        """Clear all resumes from the database."""
        try:
            conn = sqlite3.connect(self.db_path)
            c = conn.cursor()
            c.execute("DELETE FROM resumes")
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Error clearing index: {str(e)}")
            raise

    def verify_database(self):
        """Verify database state and fix any issues."""
        try:
            conn = sqlite3.connect(self.db_path)
            c = conn.cursor()
            
            # Check if table exists
            c.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='resumes'
            """)
            if not c.fetchone():
                print("Creating resumes table...")
                self._init_db()
            
            # Check for resumes without embeddings
            c.execute("""
                SELECT id, name FROM resumes 
                WHERE embedding IS NULL OR embedding = ''
            """)
            missing_embeddings = c.fetchall()
            
            if missing_embeddings:
                print(f"Found {len(missing_embeddings)} resumes without embeddings")
                for resume_id, name in missing_embeddings:
                    print(f"Fixing embedding for resume {resume_id} ({name})")
                    
                    # Get resume data
                    c.execute("""
                        SELECT name, skills, experience, education, contact, summary 
                        FROM resumes WHERE id = ?
                    """, (resume_id,))
                    resume_data = c.fetchone()
                    
                    if resume_data:
                        # Create new embedding
                        text_parts = [
                            resume_data[5] or '',  # summary
                            ' '.join(json.loads(resume_data[1])),  # skills
                            resume_data[2] or '',  # experience
                            resume_data[3] or '',  # education
                            ' '.join(str(v) for v in json.loads(resume_data[4] or '{}').values())  # contact
                        ]
                        text_blob = ' '.join(filter(None, text_parts))
                        embedding = self.model.encode(text_blob).tolist()
                        
                        # Update embedding
                        c.execute("""
                            UPDATE resumes 
                            SET embedding = ? 
                            WHERE id = ?
                        """, (json.dumps(embedding), resume_id))
            
            conn.commit()
            conn.close()
            print("Database verification complete")
        except Exception as e:
            print(f"Error verifying database: {str(e)}")
            raise 