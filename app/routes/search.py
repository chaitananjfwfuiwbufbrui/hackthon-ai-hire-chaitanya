from fastapi import APIRouter, HTTPException, Depends
from app.services.search_engine import SearchEngine
from app.models import SearchQuery, SearchResponse, SessionLocal
from typing import List, Dict, Any
from sqlalchemy.orm import Session
import json
import sqlite3
from app.services.screening_generator import ScreeningGenerator
from app.services.email_generator import EmailGenerator
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

router = APIRouter()
search_engine = SearchEngine()
screening_generator = ScreeningGenerator()
email_generator = EmailGenerator()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/all/", response_model=List[Dict[str, Any]])
async def get_all_resumes(db: Session = Depends(get_db)):
    """Get all resumes from the database."""
    try:
        conn = sqlite3.connect(search_engine.db_path)
        c = conn.cursor()
        c.execute("SELECT id, name, skills, experience, education, contact, summary FROM resumes")
        rows = c.fetchall()
        conn.close()
        
        results = []
        for row in rows:
            results.append({
                "id": row[0],
                "name": row[1],
                "skills": json.loads(row[2]),
                "experience": row[3],
                "education": row[4],
                "contact": json.loads(row[5]),
                "summary": row[6]
            })
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving resumes: {str(e)}")

@router.post("/search/", response_model=Dict[str, Any])
async def search_candidates(query: SearchQuery, db: Session = Depends(get_db)):
    """Search for candidates matching the query using RAG."""
    try:
        if not query.query:
            raise HTTPException(status_code=400, detail="Search query is required")
        
        # Verify database state before searching
        search_engine.verify_database()
            
        results = search_engine.search(
            query=query.query,
            location=query.location,
            experience_years=query.experience_years
        )
        
        if not results["matches"]:
            return {
                "matches": [],
                "analysis": "No matching resumes found for your query."
            }
            
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching candidates: {str(e)}")

@router.get("/resumes/{resume_id}", response_model=Dict[str, Any])
async def get_resume(resume_id: int, db: Session = Depends(get_db)):
    """Get a specific resume by ID."""
    try:
        conn = sqlite3.connect(search_engine.db_path)
        c = conn.cursor()
        c.execute("SELECT id, name, skills, experience, education, contact, summary FROM resumes WHERE id = ?", (resume_id,))
        resume = c.fetchone()
        conn.close()
        
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
            
        return {
            "id": resume[0],
            "name": resume[1],
            "skills": json.loads(resume[2]),
            "experience": resume[3],
            "education": resume[4],
            "contact": json.loads(resume[5]),
            "summary": resume[6]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving resume: {str(e)}")

@router.post("/add-candidate/")
async def add_candidate(candidate: dict):
    """Add a new candidate to the search index."""
    try:
        search_engine.add_candidate(candidate)
        return {"message": "Candidate added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding candidate: {str(e)}")

@router.delete("/clear-index/")
async def clear_index():
    """Clear the search index."""
    try:
        search_engine.clear_index()
        return {"message": "Search index cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing index: {str(e)}")

@router.get("/resume/{resume_id}", response_model=Dict[str, Any])
async def get_resume_details(resume_id: int, db: Session = Depends(get_db)):
    """Get detailed information about a specific resume."""
    try:
        conn = sqlite3.connect(search_engine.db_path)
        c = conn.cursor()
        
        # Get basic resume information
        c.execute("""
            SELECT id, name, skills, experience, education, contact, summary, created_at
            FROM resumes 
            WHERE id = ?
        """, (resume_id,))
        resume = c.fetchone()
        
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
            
        # Parse the resume data
        resume_data = {
            "id": resume[0],
            "name": resume[1],
            "skills": json.loads(resume[2]) if resume[2] else [],
            "experience": resume[3],
            "education": resume[4],
            "contact": json.loads(resume[5]) if resume[5] else {},
            "summary": resume[6],
            "created_at": resume[7]
        }
        
        # Extract first name
        first_name = resume_data["name"].split()[0] if resume_data["name"] else ""
        
        # Parse education details
        education_details = []
        if resume_data["education"]:
            # Split education by commas and clean up
            education_parts = [part.strip() for part in resume_data["education"].split(",")]
            for part in education_parts:
                if part:
                    education_details.append({
                        "degree": part,
                        "year": None,  # You might want to extract years if available in the format
                        "institution": None  # You might want to extract institution if available in the format
                    })
        
        # Extract certifications
        certifications = []
        if resume_data["education"]:
            cert_keywords = ["CPA", "CA", "CMA", "Certified", "Professional", "Associate"]
            for part in education_parts:
                if any(keyword in part for keyword in cert_keywords):
                    certifications.append({
                        "name": part,
                        "issuing_organization": None,  # You might want to extract this if available
                        "year": None  # You might want to extract this if available
                    })
        
        # Structure the response
        detailed_response = {
            "basic_info": {
                "id": resume_data["id"],
                "first_name": first_name,
                "full_name": resume_data["name"],
                "experience_years": resume_data["experience"],
                "summary": resume_data["summary"]
            },
            "contact_info": resume_data["contact"],
            "skills": resume_data["skills"],
            "education": {
                "details": education_details,
                "certifications": certifications
            },
            "work_experience": {
                "summary": resume_data["experience"],
                "details": []  # You might want to extract more detailed work experience if available
            },
            "created_at": resume_data["created_at"]
        }
        
        conn.close()
        return detailed_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving resume details: {str(e)}")

@router.get("/resume/{resume_id}/screening-questions")
async def get_screening_questions(resume_id: int, db: Session = Depends(get_db)):
    """Generate AI screening questions for a candidate based on their skills and experience."""
    try:
        conn = sqlite3.connect(search_engine.db_path)
        c = conn.cursor()
        c.execute("SELECT name, skills, experience FROM resumes WHERE id = ?", (resume_id,))
        row = c.fetchone()
        conn.close()
        if not row:
            raise HTTPException(status_code=404, detail="Resume not found")
        name, skills_json, experience = row
        skills = json.loads(skills_json) if skills_json else []
        # Use the top skill or fallback
        skill = skills[0] if skills else "developer"
        questions = screening_generator.generate_questions(skill=skill, level="senior" if experience and ("5" in experience or "senior" in experience.lower()) else "mid")
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating screening questions: {str(e)}")

@router.post("/resume/{resume_id}/generate-email")
async def generate_outreach_email(resume_id: int, template: str = "initial_outreach", db: Session = Depends(get_db)):
    """Generate an outreach email for a candidate based on a template."""
    try:
        conn = sqlite3.connect(search_engine.db_path)
        c = conn.cursor()
        c.execute("SELECT name, skills, experience FROM resumes WHERE id = ?", (resume_id,))
        row = c.fetchone()
        conn.close()
        if not row:
            raise HTTPException(status_code=404, detail="Resume not found")
        name, skills_json, experience = row
        skills = json.loads(skills_json) if skills_json else []
        skill = skills[0] if skills else "developer"
        key_skills = ", ".join(skills) if skills else skill
        # You can expand template logic as needed
        company_name = os.getenv("COMPANY_NAME", "Our Company")
        position = os.getenv("POSITION_TITLE", "Developer")
        location = os.getenv("COMPANY_LOCATION", "")
        email = email_generator.generate_email(
            name=name,
            skill=skill,
            company_name=company_name,
            position=position,
            template=template,
            location=location,
            key_skills=key_skills
        )
        return email
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating outreach email: {str(e)}")

@router.post("/resume/{resume_id}/send-email")
async def send_email(resume_id: int, payload: dict):
    """Send an email to the candidate using SMTP config from .env."""
    to_email = payload.get("to")
    subject = payload.get("subject")
    body = payload.get("body")
    if not (to_email and subject and body):
        raise HTTPException(status_code=400, detail="Missing to, subject, or body.")
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    sender_email = os.getenv("SENDER_EMAIL")
    if not all([smtp_host, smtp_port, smtp_user, smtp_pass, sender_email]):
        raise HTTPException(status_code=500, detail="SMTP configuration is incomplete.")
    try:
        msg = MIMEMultipart()
        msg["From"] = sender_email
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(sender_email, to_email, msg.as_string())
        return {"message": "Email sent successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

@router.get("/dashboard-metrics")
async def dashboard_metrics():
    """Return dashboard metrics for the frontend dashboard."""
    try:
        conn = sqlite3.connect(search_engine.db_path)
        c = conn.cursor()
        # Total candidates
        c.execute("SELECT COUNT(*) FROM resumes")
        total_candidates = c.fetchone()[0] or 0
        # Average experience (try to parse as float, skip if not possible)
        c.execute("SELECT experience FROM resumes")
        experiences = c.fetchall()
        exp_years = []
        for row in experiences:
            try:
                val = float(row[0].split()[0]) if row[0] else 0
                exp_years.append(val)
            except Exception:
                continue
        avg_experience = round(sum(exp_years) / len(exp_years), 1) if exp_years else 0
        # Top location
        c.execute("SELECT contact FROM resumes")
        locations = []
        for row in c.fetchall():
            try:
                contact = json.loads(row[0])
                if contact.get("location"):
                    locations.append(contact["location"])
            except Exception:
                continue
        top_location = max(set(locations), key=locations.count) if locations else ""
        # Top skill
        c.execute("SELECT skills FROM resumes")
        all_skills = []
        for row in c.fetchall():
            try:
                skills = json.loads(row[0])
                all_skills.extend(skills)
            except Exception:
                continue
        top_skill = max(set(all_skills), key=all_skills.count) if all_skills else ""
        # Skill distribution
        skill_dist = []
        if all_skills:
            from collections import Counter
            skill_counts = Counter(all_skills)
            total = sum(skill_counts.values())
            for skill, count in skill_counts.items():
                skill_dist.append({"name": skill, "value": round(100 * count / total)})
        # Experience distribution (by years)
        exp_dist = []
        if exp_years:
            from collections import Counter
            exp_bins = [str(int(y)) for y in exp_years]
            exp_counts = Counter(exp_bins)
            for years, count in exp_counts.items():
                exp_dist.append({"name": f"{years} years", "value": count})
        # Location distribution
        loc_dist = []
        if locations:
            from collections import Counter
            loc_counts = Counter(locations)
            for loc, count in loc_counts.items():
                loc_dist.append({"name": loc, "value": count})
        # Skill gaps (dummy for now, can be improved)
        skill_gaps = []
        conn.close()
        return {
            "total_candidates": total_candidates,
            "average_experience": avg_experience,
            "top_location": top_location,
            "top_skill": top_skill,
            "skill_distribution": skill_dist,
            "experience_distribution": exp_dist,
            "location_distribution": loc_dist,
            "skill_gaps": skill_gaps
        }
    except Exception as e:
        return {
            "total_candidates": 0,
            "average_experience": 0,
            "top_location": "",
            "top_skill": "",
            "skill_distribution": [],
            "experience_distribution": [],
            "location_distribution": [],
            "skill_gaps": [],
            "error": str(e)
        } 