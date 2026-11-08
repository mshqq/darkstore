from database import DbSession
from fastapi import APIRouter, HTTPException, status
from models.user import User

from auth.dependencies import CurrentUser
from auth.schemas import LoginRequest, TokenResponse, UserRead
from auth.service import AuthenticationError, AuthService

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def login(
    data: LoginRequest,
    db: DbSession,
) -> TokenResponse:
    service = AuthService(db)

    try:
        token = service.login(data)
    except AuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)
        ) from exc

    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserRead, status_code=status.HTTP_200_OK)
def get_me(user: CurrentUser) -> User:
    return user

