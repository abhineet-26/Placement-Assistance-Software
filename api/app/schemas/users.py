from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid
from app.models.users import RoleEnum

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: RoleEnum

class UserOut(UserBase):
    id: uuid.UUID
    role: RoleEnum
    is_active: bool

    class Config:
        from_attributes = True

class StudentCreate(BaseModel):
    email: EmailStr
    password: str
    roll_number: str
    full_name: str

class CompanyCreate(BaseModel):
    email: EmailStr
    password: str
    company_name: str
