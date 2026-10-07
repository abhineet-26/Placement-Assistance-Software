from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.users import User, Student, Company, RoleEnum, ApprovalStatusEnum
from app.schemas.users import StudentCreate, CompanyCreate
from app.schemas.auth import LoginSchema, RefreshSchema, Token
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from jose import jwt, JWTError
from app.core import security

router = APIRouter()

@router.post("/register/student", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_student(data: StudentCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(Student).filter(Student.roll_number == data.roll_number).first():
        raise HTTPException(status_code=400, detail="Roll number already registered")
    
    user = User(
        email=data.email,
        password_hash=get_password_hash(data.password),
        role=RoleEnum.student
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    student = Student(
        user_id=user.id,
        roll_number=data.roll_number,
        full_name=data.full_name
    )
    db.add(student)
    db.commit()

    access_token = create_access_token(user.id, user.role.value)
    refresh_token = create_refresh_token(user.id, user.role.value)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/register/company", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_company(data: CompanyCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=data.email,
        password_hash=get_password_hash(data.password),
        role=RoleEnum.company
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    company = Company(
        user_id=user.id,
        company_name=data.company_name,
        approval_status=ApprovalStatusEnum.pending
    )
    db.add(company)
    db.commit()

    access_token = create_access_token(user.id, user.role.value)
    refresh_token = create_refresh_token(user.id, user.role.value)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token = create_access_token(user.id, user.role.value)
    refresh_token = create_refresh_token(user.id, user.role.value)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/refresh", response_model=Token)
def refresh_token(data: RefreshSchema, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(
            data.refresh_token, security.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        user_id = payload.get("sub")
        role = payload.get("role")
        if user_id is None:
            raise HTTPException(status_code=403, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid token")

    access_token = create_access_token(user_id, role)
    refresh_token = create_refresh_token(user_id, role)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}
