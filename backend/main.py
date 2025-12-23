from fastapi import FastAPI
from database import engine, Base
from routes import profile, book, auth, translation, review
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Booky-Trans")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)

app.include_router(profile.router)
app.include_router(book.router)
app.include_router(auth.router)
app.include_router(translation.router)
app.include_router(review.router)



from fastapi.staticfiles import StaticFiles

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
