from app.auth import get_password_hash
from app.database import SessionLocal
from app import models

def create_btc_user():
    db = SessionLocal()
    hashed_password = get_password_hash("btc123")
    user = models.User(
        username="btc",
        hashed_password=hashed_password,
        role="BTC"
    )
    db.add(user)
    db.commit()
    db.close()
    print("BTC user created: btc / btc123")

if __name__ == "__main__":
    create_btc_user()
