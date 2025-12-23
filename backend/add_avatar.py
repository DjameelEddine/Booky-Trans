from sqlalchemy import text
from database import SessionLocal

db = SessionLocal()
db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255)"))
db.commit()
db.close()
print(" Avatar column added - delete this file")

