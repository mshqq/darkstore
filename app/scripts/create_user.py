from getpass import getpass

from auth.security import hash_password
from database import SessionLocal
from models.user import User
from sqlalchemy.exc import IntegrityError


def main() -> None:
    username = input("Логин: ").strip()
    password = getpass("Пароль: ").strip()
    confirmation = getpass("Повтори пароль: ").strip()

    if password != confirmation:
        raise SystemExit("Пароли не совпадают")

    if not (1 <= len(username) <= 64):
        raise SystemExit("Длина логина должна быть от 1 до 64 символов")

    if len(password) < 8:
        raise SystemExit("Длина пароля минимум 8 символов")

    password_hash = hash_password(password)

    with SessionLocal() as db:
        user = User(username=username, password_hash=password_hash)
        db.add(user)

        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise SystemExit("Пользователь с таким логином уже существует") from None

    print(f"Сотрудник {username} создан")


if __name__ == "__main__":
    main()
