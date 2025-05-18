from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import resume, search

app = FastAPI(
    title="PeopleGPT API",
    description="AI-powered talent acquisition and screening platform",
    version="1.0.0"
)

origins = [
    "http://localhost:8080",        # Local frontend
    "https://talent-alchemy-ui.vercel.app",    # Deployed frontend
    "*"                             # Optional: All origins (dev only)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Or use ["*"] for all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(search.router, prefix="/api/search", tags=["search"])

@app.get("/")
async def root():
    return {"message": "Welcome to PeopleGPT API"}
