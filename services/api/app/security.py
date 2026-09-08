import uuid
from dataclasses import dataclass

from fastapi import Header, HTTPException, status
from jose import JWTError, jwt

from app.config import get_settings

settings = get_settings()


@dataclass
class Identity:
    """Either an authenticated Supabase user or an anonymous guest identified by a client token."""

    user_id: uuid.UUID | None
    guest_token: str | None

    @property
    def is_authenticated(self) -> bool:
        return self.user_id is not None


def _decode_supabase_jwt(token: str) -> uuid.UUID:
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from exc

    subject = payload.get("sub")
    if not subject:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing subject")
    return uuid.UUID(subject)


async def get_identity(
    authorization: str | None = Header(default=None),
    x_guest_token: str | None = Header(default=None),
) -> Identity:
    """Resolve the caller's identity from either a Supabase bearer token or a guest token header.

    Guests get exactly one project (enforced in the projects router) identified by a
    client-generated `X-Guest-Token` (e.g. a UUID stored in localStorage). Once they sign in,
    call POST /projects/migrate to attach that guest project to their new account.
    """
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1]
        user_id = _decode_supabase_jwt(token)
        return Identity(user_id=user_id, guest_token=None)

    if x_guest_token:
        return Identity(user_id=None, guest_token=x_guest_token)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Provide either an Authorization bearer token or an X-Guest-Token header",
    )
