from datetime import datetime
import sqlite3

# Dados de exemplo para seed
livros = [
    {
        "titulo": "O Senhor dos Anéis",
        "autor": "J.R.R. Tolkien",
        "ano": 1954,
        "genero": "ficção",
        "isbn": "9788533615540",
        "status": "disponível"
    },
    {
        "titulo": "1984",
        "autor": "George Orwell",
        "ano": 1949,
        "genero": "ficção",
        "isbn": "9788535914849",
        "status": "disponível"
    },
    {
        "titulo": "Dom Casmurro",
        "autor": "Machado de Assis",
        "ano": 1899,
        "genero": "romance",
        "isbn": "9788535910682",
        "status": "disponível"
    },
    # ... adicionar mais 17 livros
]

def seed_database():
    conn = sqlite3.connect('backend/app.db')
    cursor = conn.cursor()

    for livro in livros:
        cursor.execute("""
            INSERT INTO livros (titulo, autor, ano, genero, isbn, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            livro["titulo"],
            livro["autor"],
            livro["ano"],
            livro["genero"],
            livro["isbn"],
            livro["status"]
        ))

    conn.commit()
    conn.close()

if __name__ == "__main__":
    seed_database()
    print("Seed concluído com sucesso!")
