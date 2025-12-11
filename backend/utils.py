from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

<<<<<<< HEAD

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
=======
def hash(password: str):
    return pwd_context.hash(password)

def verify(password, hashed_password):
    return pwd_context.verify(password, hashed_password)
>>>>>>> develop
