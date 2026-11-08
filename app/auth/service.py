from models.user import User
from sqlalchemy import select
from sqlalchemy.orm import Session

from auth.schemas import LoginRequest
from auth.security import create_access_token, verify_password


class AuthenticationError(Exception):
    pass


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def login(self, data: LoginRequest) -> str:
        user = self.db.scalar(select(User).where(User.username == data.username))

        if user is None or not verify_password(data.password, user.password_hash):
            raise AuthenticationError("Неверный логин или пароль")

        if not user.is_active:
            raise AuthenticationError("Неверный логин или пароль")

        return create_access_token(user.id)
