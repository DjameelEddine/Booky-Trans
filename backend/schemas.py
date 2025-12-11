from pydantic import BaseModel, EmailStr
import datetime
from typing import Optional, Literal


class UserLogin(BaseModel):
    username: str
    password: str

# ----------------- User schemas -----------------
class UserBase(BaseModel):
<<<<<<< HEAD
    first_name: str
    last_name: str
    email: EmailStr
=======
    first_name : str
    last_name : str
    email : EmailStr
>>>>>>> develop

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
<<<<<<< HEAD
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str
=======
    first_name : Optional[str] = None
    last_name : Optional[str] = None
    email : Optional[EmailStr] = None
    password : Optional[str] = None
>>>>>>> develop

# ----------------- Book schemas -----------------

class BookCreate(BaseModel):
    name: str
    category: str
    author: Optional[str] = None
    language: str
    target_language: str

class BookOut(BookCreate):
    id: int

<<<<<<< HEAD
# ----------------- Translation schemas -----------------

=======
# class BookUpdate(BaseModel):
#     first_name: Optional[str] = None
#     last_name: Optional[str] = None
#     email: Optional[EmailStr] = None
#     phone: Optional[str] = None

# ----------------- Translation schemas -----------------


>>>>>>> develop
class TranslationCreate(BaseModel):
    book_id: int
    user_id: int
    upload_date: datetime.date

class TranslationOut(TranslationCreate):
    id: int
<<<<<<< HEAD

    class Config:
        from_attributes = True

=======
    class Config:
        from_attributes = True

# class TranslationUpdate(BaseModel):
#     date: Optional[datetime.date] = None
#     time: Optional[datetime.time] = None
#     case: Optional[str] = None

>>>>>>> develop
# ------------------ Review ------------------

class ReviewBase(BaseModel):
    user_id: int
    translation_id: int
    date_issued: datetime.date
    rating: Literal[1, 2, 3, 4, 5]
    comment: Optional[str] = None
<<<<<<< HEAD
=======
    
>>>>>>> develop

# ------------------ JWT Tokens ------------------

class Token(BaseModel):
    access_token: str
    token_type: str
<<<<<<< HEAD

class TokenData(BaseModel):
    id: Optional[int] = None
=======
    

# what payload data does the token embeds
class TokenData(BaseModel):
    id : Optional[int] = None
>>>>>>> develop
