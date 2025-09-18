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
    {
        "titulo": "O Pequeno Príncipe",
        "autor": "Antoine de Saint-Exupéry",
        "ano": 1943,
        "genero": "infantil",
        "isbn": "9782070612758",
        "status": "disponível"
    },
    {
        "titulo": "Cem Anos de Solidão",
        "autor": "Gabriel García Márquez",
        "ano": 1967,
        "genero": "realismo mágico",
        "isbn": "9780307474728",
        "status": "disponível"
    },
    {
        "titulo": "A Revolução dos Bichos",
        "autor": "George Orwell",
        "ano": 1945,
        "genero": "sátira",
        "isbn": "9780141036137",
        "status": "disponível"
    },
    {
        "titulo": "O Alquimista",
        "autor": "Paulo Coelho",
        "ano": 1988,
        "genero": "ficção",
        "isbn": "9780061122415",
        "status": "disponível"
    },
    {
        "titulo": "A Metamorfose",
        "autor": "Franz Kafka",
        "ano": 1915,
        "genero": "ficção",
        "isbn": "9788535911566",
        "status": "disponível"
    },
    {
        "titulo": "O Diário de Anne Frank",
        "autor": "Anne Frank",
        "ano": 1947,
        "genero": "memórias",
        "isbn": "9780553296983",
        "status": "disponível"
    },
    {
        "titulo": "O Morro dos Ventos Uivantes",
        "autor": "Emily Brontë",
        "ano": 1847,
        "genero": "romance",
        "isbn": "9780141439556",
        "status": "disponível"
    },
    {
        "titulo": "Os Miseráveis",
        "autor": "Victor Hugo",
        "ano": 1862,
        "genero": "romance",
        "isbn": "9780451419439",
        "status": "disponível"
    },
    {
        "titulo": "O Hobbit",
        "autor": "J.R.R. Tolkien",
        "ano": 1937,
        "genero": "fantasia",
        "isbn": "9780261103344",
        "status": "disponível"
    },
    {
        "titulo": "A Menina que Roubava Livros",
        "autor": "Markus Zusak",
        "ano": 2005,
        "genero": "histórico",
        "isbn": "9780375842207",
        "status": "disponível"
    },
    {
        "titulo": "O Guia do Mochileiro das Galáxias",
        "autor": "Douglas Adams",
        "ano": 1979,
        "genero": "ficção científica",
        "isbn": "9780345391803",
        "status": "disponível"
    },
    {
        "titulo": "Memórias Póstumas de Brás Cubas",
        "autor": "Machado de Assis",
        "ano": 1881,
        "genero": "romance",
        "isbn": "9788520926509",
        "status": "disponível"
    },
    {
        "titulo": "Grande Sertão: Veredas",
        "autor": "João Guimarães Rosa",
        "ano": 1956,
        "genero": "regional",
        "isbn": "9788535909724",
        "status": "disponível"
    },
    {
        "titulo": "Ensaio sobre a Cegueira",
        "autor": "José Saramago",
        "ano": 1995,
        "genero": "ficção",
        "isbn": "9780156007757",
        "status": "disponível"
    },
    {
        "titulo": "O Código Da Vinci",
        "autor": "Dan Brown",
        "ano": 2003,
        "genero": "thriller",
        "isbn": "9780307474278",
        "status": "disponível"
    },
    {
        "titulo": "A Sangue Frio",
        "autor": "Truman Capote",
        "ano": 1966,
        "genero": "true crime",
        "isbn": "9780679745587",
        "status": "disponível"
    }
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
