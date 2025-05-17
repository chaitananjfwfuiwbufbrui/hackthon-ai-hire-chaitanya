from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from sqlalchemy import Column, Integer, String, JSON, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLAlchemy setup
Base = declarative_base()

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    skills = Column(JSON)  # Store as JSON array
    experience = Column(String)
    education = Column(String, nullable=True)
    contact = Column(JSON, nullable=True)  # Store as JSON object
    summary = Column(String, nullable=True)
    created_at = Column(String)  # Store timestamp as string

# Create database engine and session
engine = create_engine("sqlite:///./data/resumes.db")
Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class ResumeUploadResponse(BaseModel):
    name: str
    skills: List[str]
    experience: str
    education: Optional[str] = None
    contact: Optional[Dict[str, str]] = None
    summary: Optional[str] = None

class SearchQuery(BaseModel):
    query: str
    location: Optional[str] = None
    experience_years: Optional[int] = None

class SearchResult(BaseModel):
    name: str
    skills: List[str]
    score: float
    experience: str
    location: Optional[str] = None

class SearchResponse(BaseModel):
    matches: List[Dict[str, Any]]
    analysis: str

class ScreeningRequest(BaseModel):
    skill: str
    level: str = Field(..., description="junior, mid, or senior")

class ScreeningResponse(BaseModel):
    questions: List[str]

class EmailRequest(BaseModel):
    name: str
    skill: str
    company_name: Optional[str] = None
    position: Optional[str] = None

class EmailResponse(BaseModel):
    email: str

class BackgroundCheckRequest(BaseModel):
    name: str
    location: str

class BackgroundCheckResponse(BaseModel):
    status: str
    details: str 