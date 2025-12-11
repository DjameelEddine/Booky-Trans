from sqlalchemy import create_engine
<<<<<<< HEAD
from sqlalchemy.orm import sessionmaker, declarative_base
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_hostname: str
    database_port: int
    database_password: str
    database_username: str
    database_name: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int

    class Config:
        env_file = ".env"


settings = Settings()

DATABASE_URL = (
    f"postgresql://{settings.database_username}:"
    f"{settings.database_password}@"
    f"{settings.database_hostname}:"
    f"{settings.database_port}/"
    f"{settings.database_name}"
)

engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

=======
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

DATABASE_URL = f'postgresql://{settings.database_username}:{settings.database_password}@{settings.database_hostname}:{settings.database_port}/{settings.database_name}'

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base() # all models defined to create tables
                        # have to extedning this base class
>>>>>>> develop

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
<<<<<<< HEAD
print("DB URL:", DATABASE_URL)
=======
>>>>>>> develop
