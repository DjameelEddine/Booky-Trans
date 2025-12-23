from sqlalchemy import create_engine, text

# YOUR DATABASE INFO - EXACTLY CORRECT
DATABASE_URL = "postgresql+psycopg2://postgres:djamel123@localhost:5432/booky_trans"

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR"))
    conn.execute(text("ALTER TABLE users ALTER COLUMN avatar_url TYPE VARCHAR(255)"))
    conn.commit()
    
print(" DATABASE FIXED! bio column added.")
print("Restart backend NOW!")
