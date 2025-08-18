from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from . import models
from .database import get_db

app = FastAPI()

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar origens permitidas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos
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

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
