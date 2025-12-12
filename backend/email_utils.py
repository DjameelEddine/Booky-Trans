reset_codes = {}

import random
import time

def generate_reset_code():
    return str(random.randint(100000, 999999))

def store_reset_code(email: str, code: str, expires_in_minutes: int = 15):
    expires_at = time.time() + (expires_in_minutes * 60)
    reset_codes[email] = {
        "code": code,
        "expires": expires_at
    }

def verify_reset_code(email: str, code: str) -> bool:
    if email not in reset_codes:
        return False
    
    stored_data = reset_codes[email]
    
    # Check if expired
    if time.time() > stored_data["expires"]:
        del reset_codes[email]
        return False
    
    # Check if code matches
    return stored_data["code"] == code

def delete_reset_code(email: str):
    if email in reset_codes:
        del reset_codes[email]

def send_reset_email(email: str, code: str):
    print(f"\n{'='*50}")
    print(f"PASSWORD RESET EMAIL")
    print(f"{'='*50}")
    print(f"To: {email}")
    print(f"Subject: Password Reset Verification Code")
    print(f"\nYour verification code is: {code}")
    print(f"This code will expire in 15 minutes.")
    print(f"{'='*50}\n")