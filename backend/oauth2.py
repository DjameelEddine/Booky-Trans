# FILE TO CREATE AND VERIFY JWT TOKENS
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
import schemas
from fastapi.security import OAuth2PasswordBearer
from fastapi import HTTPException, status, Depends
from database import get_db
from sqlalchemy.orm import Session
import models
from config import settings

# to extract the bearer token automatically from the header
# and to define where clients should get tokens (/login)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes

def create_access_token(payload: dict):
    payload_to_encode = payload.copy()

 
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload_to_encode.update({"exp": expire})

    # create a token
    token = jwt.encode(payload_to_encode, SECRET_KEY, ALGORITHM)

    return token

def verify_access_token(token: str, credentials_exception):

    try:
       
        payload = jwt.decode(token, SECRET_KEY, [ALGORITHM])

        id = payload.get('user_id')

        if not id:
            raise credentials_exception
        
       
        token_data = schemas.TokenData(id=id)

    except JWTError:
        raise credentials_exception
    
    return token_data
    


def get_current_user(token: str=Depends(oauth2_scheme), db:Session=Depends(get_db)):

    cred_exc = HTTPException(status_code=401, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    token_data = verify_access_token(token, cred_exc)

    user = db.query(models.User).filter_by(id=token_data.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user