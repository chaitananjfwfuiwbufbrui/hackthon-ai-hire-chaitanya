from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.services.resume_parser import ResumeParser
from app.models import ResumeUploadResponse, SessionLocal
from app.services.database import store_resume, get_resume, get_all_resumes, search_resumes
import os
import shutil
from typing import Optional, List
import time

router = APIRouter()
resume_parser = ResumeParser()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload/", response_model=ResumeUploadResponse)
async def upload_resume(file: UploadFile = File(...), db = Depends(get_db)):
    """Upload and parse a resume."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
        
    if not file.filename.lower().endswith(('.pdf', '.doc', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and Word documents are allowed")
    
    # Create uploads directory if it doesn't exist
    os.makedirs("data/resumes", exist_ok=True)
    
    # Generate a unique filename
    timestamp = int(time.time())
    file_path = f"data/resumes/{timestamp}_{file.filename}"
    
    try:
        # Save the uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        file.file.close()  # Ensure the uploaded file is closed
        
        # Parse the resume
        result = resume_parser.parse_resume_text(file_path)
        
        # Store in database
        store_resume(db, result)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")
        
    finally:
        # Clean up the uploaded file
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Warning: Could not delete temporary file {file_path}: {str(e)}")

@router.get("/resumes/{resume_id}", response_model=ResumeUploadResponse)
def get_resume(resume_id: int, db = Depends(get_db)):
    """Get a specific resume by ID."""
    resume = get_resume(db, resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume

@router.get("/resumes/", response_model=List[ResumeUploadResponse])
def list_resumes(skip: int = 0, limit: int = 100, db = Depends(get_db)):
    """List all resumes with pagination."""
    return get_all_resumes(db, skip, limit)

@router.get("/resumes/search/", response_model=List[ResumeUploadResponse])
def search_resumes(query: str, db = Depends(get_db)):
    """Search resumes by name, skills, or summary."""
    return search_resumes(db, query) 