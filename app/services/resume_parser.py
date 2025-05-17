import fitz  # PyMuPDF
import re
import json
from typing import Dict, List, Optional
from .llm_utils import call_groq

class ResumeParser:
    def __init__(self):
        self.tech_keywords = [
            'Python', 'JavaScript', 'React', 'Node.js', 'AWS', 'Docker',
            'Kubernetes', 'Machine Learning', 'Data Science', 'SQL',
            'MongoDB', 'TypeScript', 'Angular', 'Vue.js', 'Java', 'C++',
            'Go', 'Rust', 'DevOps', 'CI/CD'
        ]

    def parse_resume_text(self, pdf_path: str) -> Dict:
        """Parse resume PDF and extract relevant information using LLM."""
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()  # Close the PDF file

        prompt_template = f"""
            You are a resume parser. Extract information from the following resume text and return it in a specific JSON format.
            
            Rules:
            1. Return ONLY the JSON object, no other text
            2. Do not include markdown formatting
            3. Ensure all fields are present
            4. Keep the exact field names as shown
            5. For the summary field, create a concise 2-3 sentence summary highlighting:
               - Key skills and expertise
               - Years of experience
               - Domain expertise
               - Notable achievements or projects
            
            Required JSON format:
            {{
                "name": "full name",
                "skills": ["skill1", "skill2"],
                "experience": "X years",
                "education": "degree and university",
                "contact": {{
                    "email": "email address",
                    "phone": "phone number"
                }},
                "summary": "2-3 sentence professional summary highlighting key skills, experience, and achievements"
            }}

            Resume text:
            {text}
        """

        try:
            response, _ = call_groq(prompt_template)
            
            # Clean the response
            cleaned_response = response.strip()
            if cleaned_response.startswith('```'):
                cleaned_response = re.sub(r'^```json\s*|\s*```$', '', cleaned_response)
            
            # Parse the JSON string into a dictionary
            parsed_data = json.loads(cleaned_response)
            
            # Ensure all required fields are present with defaults
            result = {
                "name": parsed_data.get("name", "Unknown"),
                "skills": parsed_data.get("skills", []),
                "experience": parsed_data.get("experience", "Experience not specified"),
                "education": parsed_data.get("education"),
                "contact": parsed_data.get("contact", {}),
                "summary": parsed_data.get("summary", "No summary available")
            }
            
            return result
            
        except Exception as e:
            print(f"Error parsing resume with LLM: {str(e)}")
            # Fallback to basic parsing
            return {
                "name": self._extract_name(text),
                "skills": self._extract_skills(text),
                "experience": self._extract_experience(text),
                "education": self._extract_education(text),
                "contact": self._extract_contact(text),
                "summary": "No summary available"
            }

    def _extract_name(self, text: str) -> str:
        """Extract name from resume text."""
        lines = text.split('\n')
        if lines:
            return lines[0].strip()
        return "Unknown"

    def _extract_skills(self, text: str) -> List[str]:
        """Extract technical skills from resume text."""
        found_skills = []
        text_lower = text.lower()
        
        for skill in self.tech_keywords:
            if skill.lower() in text_lower:
                found_skills.append(skill)
        
        return found_skills

    def _extract_experience(self, text: str) -> str:
        """Extract work experience from resume text."""
        experience_patterns = [
            r'(\d+)\+?\s*years?\s*of\s*experience',
            r'experience:\s*(\d+)\+?\s*years?',
            r'(\d+)\+?\s*years?\s*in\s*the\s*field'
        ]
        
        for pattern in experience_patterns:
            match = re.search(pattern, text.lower())
            if match:
                return f"{match.group(1)} years"
        
        return "Experience not specified"

    def _extract_education(self, text: str) -> Optional[str]:
        """Extract education information from resume text."""
        education_keywords = ['Bachelor', 'Master', 'PhD', 'B.Tech', 'M.Tech', 'MBA']
        lines = text.split('\n')
        
        for line in lines:
            for keyword in education_keywords:
                if keyword in line:
                    return line.strip()
        
        return None

    def _extract_contact(self, text: str) -> Optional[Dict]:
        """Extract contact information from resume text."""
        email_pattern = r'[\w\.-]+@[\w\.-]+\.\w+'
        phone_pattern = r'\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        
        email = re.search(email_pattern, text)
        phone = re.search(phone_pattern, text)
        
        contact = {}
        if email:
            contact['email'] = email.group()
        if phone:
            contact['phone'] = phone.group()
            
        return contact if contact else None

    