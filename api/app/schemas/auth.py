from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: str
    role: str
    exp: int

class LoginSchema(BaseModel):
    email: str
    password: str

class RefreshSchema(BaseModel):
    refresh_token: str
