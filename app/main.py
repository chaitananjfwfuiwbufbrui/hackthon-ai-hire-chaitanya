from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import resume, search

app = FastAPI(
    title="PeopleGPT API",
    description="AI-powered talent acquisition and screening platform",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:3000",  # React default port
    "http://localhost:8000",  # FastAPI default port
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    "*"  # Allow all origins (not recommended for production)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers with proper prefixes
app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(search.router, prefix="/api/search", tags=["search"])

@app.get("/")
async def root():
    return {"message": "Welcome to PeopleGPT API"} 