from fastapi import FastAPI
from database import engine, Base
from routes import profile, auth  # ← ADD auth here
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Booky-Trans Profile API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

# Include ALL routes
app.include_router(profile.router, prefix="/profile", tags=["profile"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])  # ← ADD THIS LINE

@app.get("/")
def root():
    return {"message": "Profile API ✅ WORKING"}
