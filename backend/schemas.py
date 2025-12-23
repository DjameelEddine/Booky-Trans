from pydantic import BaseModel, EmailStr
import datetime
from typing import Optional, Literal

class UserLogin(BaseModel):
    username: str
    password: str

# ----------------- User schemas -----------------
class UserBase(BaseModel):
    full_name: str
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):  
    id: int
    avatar_url: Optional[str] = None
    bio: Optional[str] = None

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

# ----------------- Book schemas -----------------
class BookCreate(BaseModel):
    name: str
    category: str
    author: Optional[str] = None
    description: Optional[str] = None
    language: str
    target_language: str
    file_path: str
    img_path: Optional[str] = None

class BookOut(BookCreate):
    id: int

# ----------------- Translation schemas -----------------
class TranslationCreate(BaseModel):
    book_id: int
    user_id: int
    upload_date: datetime.date
    file_path: str

class TranslationOut(TranslationCreate):
    id: int
    
    class Config:  
        from_attributes = True

# ------------------ JWT Tokens ------------------
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[int] = None

# ----------------- Password Reset schemas -----------------
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str

# ------------------ Review ------------------
class ReviewBase(BaseModel):
    rating: Optional[Literal[1, 2, 3, 4, 5]] = None
    comment: Optional[str] = None

class ReviewUpdate(BaseModel):
    rating: Optional[Literal[1, 2, 3, 4, 5]] = None
    comment: Optional[str] = None

# -------------- User's Books Schemas ---------------
class FavoriteBookOut(BaseModel):
    id: int
    name: str
    category: str
    author: Optional[str] = None
    language: str
    target_language: str
    img_path: Optional[str] = None

    class Config:
        from_attributes = True

class UploadedBookOut(BaseModel):
    id: int
    name: str
    category: str
    author: Optional[str] = None
    language: str
    target_language: str
    img_path: Optional[str] = None

    class Config:
        from_attributes = True

class TranslatedBookOut(BaseModel):
    id: int
    name: str
    category: str
    author: Optional[str] = None
    language: str
    target_language: str
    img_path: Optional[str] = None
    upload_date: datetime.date
    translation_id: int

    class Config:
        from_attributes = True
