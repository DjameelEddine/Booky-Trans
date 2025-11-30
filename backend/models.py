from sqlalchemy import Column, Integer, String, Date, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from database import Base



class User(Base):
    __tablename__ = "users"

    ID = Column(Integer, primary_key=True, index=True)
    First_name = Column(String, nullable=False)
    Last_name = Column(String, nullable=False)
    Username = Column(String, nullable=False)
    Email = Column(String, unique=True, nullable=False)
    Password = Column(String, nullable=False)


class Book(Base):
    __tablename__ = "books"

    ID = Column(Integer, primary_key=True, index=True)
    Name = Column(String, nullable=False)
    Category = Column(String, nullable=False)
    Author = Column(String)
    Language = Column(String, nullable=False)
    Target_Language = Column(String, nullable=False)


class Translation(Base):
    __tablename__ = "translations"

    ID = Column(Integer, primary_key=True, index=True)
    Book_ID = Column(Integer, ForeignKey("books.ID", ondelete='CASCADE'))
    User_ID = Column(Integer, ForeignKey("users.ID", ondelete='CASCADE'))
    Upload_date = Column(Date, nullable=False)
    
class Review(Base):
    __tablename__ = "reviews"

    ID = Column(Integer, primary_key=True, index=True)
    translationID = Column(Integer, ForeignKey("translations.ID", ondelete='CASCADE'))
    userID = Column(Integer, ForeignKey("users.ID", ondelete='CASCADE'))
    Date_issued = Column(Date, nullable=False)
    Comment = Column(String)
    Rating = Column(Integer)

class FavoriteBooks(Base):
    __tablename__ = 'favorite_books'

    UserID = Column(Integer, ForeignKey('users.ID', ondelete='CASCADE'))
    BookID = Column(Integer, ForeignKey('books.ID', ondelete='CASCADE'))

class UploadedBooks(Base):
    __tablename__ = 'uploaded_books'

    UserID = Column(Integer, ForeignKey('users.ID', ondelete='CASCADE'))
    BookID = Column(Integer, ForeignKey('books.ID', ondelete='CASCADE'))
