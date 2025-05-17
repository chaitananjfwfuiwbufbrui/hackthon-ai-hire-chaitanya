from sqlalchemy.orm import Session
from app.models import Resume
import time

def store_resume(db: Session, resume_data: dict) -> Resume:
    """Store parsed resume data in the database."""
    db_resume = Resume(
        name=resume_data["name"],
        skills=resume_data["skills"],
        experience=resume_data["experience"],
        education=resume_data.get("education"),
        contact=resume_data.get("contact"),
        summary=resume_data.get("summary"),
        created_at=str(int(time.time()))
    )
    
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    return db_resume

def get_resume(db: Session, resume_id: int) -> Resume:
    """Retrieve a resume by ID."""
    return db.query(Resume).filter(Resume.id == resume_id).first()

def get_all_resumes(db: Session, skip: int = 0, limit: int = 100):
    """Retrieve all resumes with pagination."""
    return db.query(Resume).offset(skip).limit(limit).all()

def search_resumes(db: Session, query: str):
    """Search resumes by name, skills, or summary."""
    return db.query(Resume).filter(
        (Resume.name.ilike(f"%{query}%")) |
        (Resume.skills.cast(String).ilike(f"%{query}%")) |
        (Resume.summary.ilike(f"%{query}%"))
    ).all() 