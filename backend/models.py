from sqlalchemy import Column, Integer, String, Date, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

uploaded_books = Table(
    'Uploaded Books', Base.metadata,
    Column('User_ID', Integer, ForeignKey('Users.ID'), primary_key=True),
    Column('Book_ID', Integer, ForeignKey('Book.ID'), primary_key=True)
)

favorite_books = Table(
    'Favorite Books', Base.metadata,
    Column('User_ID', Integer, ForeignKey('Users.ID'), primary_key=True),
    Column('Book_ID', Integer, ForeignKey('Book.ID'), primary_key=True)
)


class User(Base):
    __tablename__ = "Users"

    ID = Column(Integer, primary_key=True, index=True)
    Full_Name = Column(String, nullable=False)
    Username = Column(String, nullable=False)
    Email = Column(String, unique=True, nullable=False)
    Password = Column(String, nullable=False)

    uploaded_books = relationship("Book", secondary=uploaded_books, back_populates="uploaded_by")
    favorite_books = relationship("Book", secondary=favorite_books, back_populates="favorited_by")
    translations = relationship("Translation", back_populates="user")
    reviews = relationship("Review", back_populates="user")



class Book(Base):
    __tablename__ = "Book"

    ID = Column(Integer, primary_key=True, index=True)
    Name = Column(String, nullable=False)
    Category = Column(String)
    Author = Column(String)
    Language = Column(String)
    Target_Language = Column(String)

    uploaded_by = relationship("User", secondary=uploaded_books, back_populates="uploaded_books")
    favorited_by = relationship("User", secondary=favorite_books, back_populates="favorite_books")
    translations = relationship("Translation", back_populates="book")


class Translation(Base):
    __tablename__ = "translations"

    ID = Column(Integer, primary_key=True, index=True)
    Book_ID = Column(Integer, ForeignKey("Book.ID"), nullable=False)
    User_ID = Column(Integer, ForeignKey("Users.ID"), nullable=False)
    uploadDate = Column(Date, nullable=False)

    book = relationship("Book", back_populates="translations")
    user = relationship("User", back_populates="translations")
    reviews = relationship("Review", back_populates="translation")
    
class Review(Base):
    __tablename__ = "Reviews"

    ID = Column(Integer, primary_key=True, index=True)
    translationID = Column(Integer, ForeignKey("translations.ID"))
    userID = Column(Integer, ForeignKey("Users.ID"))
    Date_Issued = Column(Date, nullable=False)
    Comment = Column(String)  # or Text
    Rating = Column(Integer)

    translation = relationship("Translation", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
