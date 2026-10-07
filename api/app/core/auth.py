from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import ValidationError
from typing import List
from sqlalchemy.orm import Session
from app.core import security
from app.schemas.auth import TokenPayload
from app.db.session import get_db
from app.models.users import User, Company, ApprovalStatusEnum

security_bearer = HTTPBearer()

def get_current_user_payload(credentials: HTTPAuthorizationCredentials = Depends(security_bearer)) -> TokenPayload:
    try:
        payload = jwt.decode(
            credentials.credentials, security.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    return token_data

def get_current_user(token_payload: TokenPayload = Depends(get_current_user_payload), db: Session = Depends(get_db)) -> User:
    user = db.query(User).filter(User.id == token_payload.sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def require_role(roles: List[str]):
    def role_checker(token_payload: TokenPayload = Depends(get_current_user_payload)):
        if token_payload.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )
        return token_payload
    return role_checker

def require_approved_company(user: User = Depends(get_current_user)):
    if user.role.value != "company":
        raise HTTPException(status_code=403, detail="Not a company")
    if not user.company or user.company.approval_status != ApprovalStatusEnum.approved:
        raise HTTPException(status_code=403, detail="Company not approved yet")
    return user
