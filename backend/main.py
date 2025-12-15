from fastapi import FastAPI
from database import engine, Base
from routes import profile, book, auth, translation, review
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Booky-Trans")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # for local testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables in the database
Base.metadata.create_all(bind=engine)

app.include_router(profile.router)
app.include_router(book.router)
app.include_router(auth.router)
app.include_router(translation.router)
app.include_router(review.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
