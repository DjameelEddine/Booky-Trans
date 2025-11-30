from pydantic import BaseModel, EmailStr
import datetime
from typing import Optional, Literal


class UserLogin(BaseModel):
    username: str
    password: str

# ----------------- User schemas -----------------
class UserBase(BaseModel):
    first_name : str
    last_name : str
    email : EmailStr

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int

class UserUpdate(BaseModel):
    first_name : Optional[str] = None
    last_name : Optional[str] = None
    email : Optional[EmailStr] = None
    password : Optional[str] = None

# ----------------- Book schemas -----------------

class BookCreate(BaseModel):
    name: str
    category: str
    author: Optional[str] = None
    language: str
    target_language: str

class BookOut(BookCreate):
    id: int

class BookUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

# ----------------- Translation schemas -----------------


class TranslationCreate(BaseModel):
    book_id: int
    user_id: int
    upload_date: datetime.date

class TranslationOut(TranslationCreate):
    id: int
    class Config:
        from_attributes = True

# class TranslationUpdate(BaseModel):
#     date: Optional[datetime.date] = None
#     time: Optional[datetime.time] = None
#     case: Optional[str] = None

# ------------------ Review ------------------

class ReviewBase(BaseModel):
    user_id: int
    translation_id: int
    date_issued: datetime.date
    rating: Literal[1, 2, 3, 4, 5]
    comment: Optional[str] = None
    

# ------------------ JWT Tokens ------------------

class Token(BaseModel):
    access_token: str
    token_type: str
    

# what payload data does the token embeds
class TokenData(BaseModel):
    id : Optional[int] = None