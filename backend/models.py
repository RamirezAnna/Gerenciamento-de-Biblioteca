from sqlalchemy.orm import Session
from . import database

# User related functions
def get_user_by_email(db: Session, email: str):
    return db.query(database.UserModel).filter(database.UserModel.email == email).first()

def create_user(db: Session, user, hashed_password: str, role: str):
    db_user = database.UserModel(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password,
        role=role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_book(db: Session, livro):
    db_livro = database.LivroModel(**livro.dict())
    db.add(db_livro)
    db.commit()
    db.refresh(db_livro)
    return db_livro

def get_books(db: Session, skip: int = 0, limit: int = 100):
    return db.query(database.LivroModel).offset(skip).limit(limit).all()

def get_book(db: Session, book_id: int):
    return db.query(database.LivroModel).filter(database.LivroModel.id == book_id).first()

def update_book(db: Session, book_id: int, livro):
    db_livro = db.query(database.LivroModel).filter(database.LivroModel.id == book_id).first()
    if db_livro:
        for key, value in livro.dict(exclude_unset=True).items():
            setattr(db_livro, key, value)
        db.commit()
        db.refresh(db_livro)
    return db_livro

def delete_book(db: Session, book_id: int):
    db_livro = db.query(database.LivroModel).filter(database.LivroModel.id == book_id).first()
    if db_livro:
        db.delete(db_livro)
        db.commit()
        return True
    return False
