from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
import uuid

app = FastAPI(title="Booky-Trans Profile API")

class UserOut(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str

class UserUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    password: str | None = None

# Fake current user (your profile data)
fake_user = UserOut(
    id=str(uuid.uuid4()),
    first_name="Isabella",
    last_name="Evans",
    email="isabella@example.com"
)

@app.get("/profile/me")
def get_profile():
    return fake_user

@app.put("/profile/me")
def update_profile(data: UserUpdate):
    if data.first_name:
        fake_user.first_name = data.first_name
    if data.last_name:
        fake_user.last_name = data.last_name
    if data.email:
        fake_user.email = data.email
    if data.password:
        print(f"Password changed for {fake_user.email}")
    return fake_user

@app.get("/")
def root():
    return {"message": "Profile API ✅ WORKING"}
