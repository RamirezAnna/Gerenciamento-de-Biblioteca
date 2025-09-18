import uvicorn
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field, validator, EmailStr
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from . import models
from .database import get_db
import requests
import os
from dotenv import load_dotenv

load_dotenv()  # Carrega variáveis do arquivo .env se presente

app = FastAPI()

# Servir arquivos estáticos
app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar origens permitidas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurações de segurança
SECRET_KEY = "your-secret-key-12345"  # Em produção, use uma chave secreta segura
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Modelos
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    role: str
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class Livro(BaseModel):
    titulo: str = Field(..., min_length=3, max_length=90)
    autor: str
    ano: int = Field(..., ge=1900, le=datetime.now().year)
    genero: str
    isbn: Optional[str] = None
    status: str = "disponível"
    data_emprestimo: Optional[datetime] = None

    @validator('status')
    def validate_status(cls, v):
        if v not in ['disponível', 'emprestado']:
            raise ValueError('Status deve ser "disponível" ou "emprestado"')
        return v
    
    class Config:
        orm_mode = True

# Funções de autenticação
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = models.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

# Rotas de autenticação
@app.post("/register", response_model=Token)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = models.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Verificar o tipo de usuário pelo email
    role = "staff" if "." in user.email else "client"
    if "_" not in user.email and "." not in user.email:
        raise HTTPException(status_code=400, detail="Email must contain '_' for client or '.' for staff")

    hashed_password = get_password_hash(user.password)
    db_user = models.create_user(db, user, hashed_password, role)
    
    access_token = create_access_token(
        data={"sub": user.email, "role": role}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login", response_model=Token)
async def login(email: str, password: str, db: Session = Depends(get_db)):
    user = models.get_user_by_email(db, email=email)
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Rotas
@app.get("/")
def read_root():
    return {"message": "API da Biblioteca Escolar"}

@app.get("/livros", response_model=List[Livro])
def listar_livros(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    livros = models.get_books(db, skip=skip, limit=limit)
    return livros

@app.post("/livros", response_model=Livro)
def criar_livro(livro: Livro, db: Session = Depends(get_db)):
    return models.create_book(db, livro)

@app.get("/livros/{livro_id}", response_model=Livro)
def obter_livro(livro_id: int, db: Session = Depends(get_db)):
    livro = models.get_book(db, livro_id)
    if livro is None:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    return livro

@app.put("/livros/{livro_id}", response_model=Livro)
def atualizar_livro(livro_id: int, livro: Livro, db: Session = Depends(get_db)):
    updated_livro = models.update_book(db, livro_id, livro)
    if updated_livro is None:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    return updated_livro

@app.delete("/livros/{livro_id}")
def deletar_livro(livro_id: int, db: Session = Depends(get_db)):
    success = models.delete_book(db, livro_id)
    if not success:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    return {"message": "Livro deletado com sucesso"}

@app.post("/livros/{livro_id}/emprestar", response_model=Livro)
def emprestar_livro(livro_id: int, db: Session = Depends(get_db)):
    livro = models.get_book(db, livro_id)
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    if livro.status == "emprestado":
        raise HTTPException(status_code=400, detail="Livro já está emprestado")
    
    return models.update_book(db, livro_id, Livro(
        **{**livro.__dict__,
           "status": "emprestado",
           "data_emprestimo": datetime.now()}
    ))

@app.post("/livros/{livro_id}/devolver", response_model=Livro)
def devolver_livro(livro_id: int, db: Session = Depends(get_db)):
    livro = models.get_book(db, livro_id)
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    if livro.status == "disponível":
        raise HTTPException(status_code=400, detail="Livro já está disponível")
    
    return models.update_book(db, livro_id, Livro(
        **{**livro.__dict__,
           "status": "disponível",
           "data_emprestimo": None}
    ))


# Endpoint para verificar reCAPTCHA (use RECAPTCHA_SECRET_KEY no ambiente em produção)
@app.post('/verify-recaptcha')
def verify_recaptcha(payload: dict):
    token = payload.get('token')
    if not token:
        return { 'success': False, 'error': 'missing-token' }

    # Exige chave secreta real via variável de ambiente em produção
    secret_key = os.getenv('RECAPTCHA_SECRET_KEY')
    if not secret_key:
        return { 'success': False, 'error': 'missing-secret' }
    verify_url = 'https://www.google.com/recaptcha/api/siteverify'
    resp = requests.post(verify_url, data={ 'secret': secret_key, 'response': token })
    try:
        data = resp.json()
    except Exception:
        return { 'success': False, 'error': 'invalid-response' }
    return data

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
