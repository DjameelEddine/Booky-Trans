from fastapi import FastAPI
# import models
from database import engine
from routes import book

# models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(book.router)