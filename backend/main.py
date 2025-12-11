from fastapi import FastAPI
from database import engine, Base
from routes import profile
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from .routes import profile (whatever you already have)


app = FastAPI(title="Booky-Trans Profile API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # for local testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables in the database
Base.metadata.create_all(bind=engine)

# Include profile routes
app.include_router(profile.router, prefix="/profile", tags=["profile"])


@app.get("/")
def root():
    return {"message": "Profile API ✅ WORKING"}
