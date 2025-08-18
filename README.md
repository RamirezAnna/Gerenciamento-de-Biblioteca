# Biblioteca Escolar

Sistema de gerenciamento de biblioteca escolar desenvolvido como parte do projeto bimestral.

## Tecnologias Utilizadas

### Frontend
- HTML5
- CSS3 (Flexbox/Grid)
- JavaScript (ES6+)

### Backend
- Python 3.8+
- FastAPI
- SQLAlchemy
- SQLite

## Estrutura do Projeto

```
/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── scripts.js
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── database.py
│   ├── seed.py
│   └── requirements.txt
├── README.md
└── REPORT.md
```

## Configuração do Ambiente

1. Instalar dependências do backend:
```bash
cd backend
pip install -r requirements.txt
```

2. Iniciar o servidor:
```bash
cd backend
uvicorn app:app --reload
```

3. Abrir o frontend:
   - Abrir o arquivo `frontend/index.html` em um navegador

## Funcionalidades

- Cadastro de livros
- Busca por título/autor
- Filtros por gênero/ano/status
- Sistema de empréstimo/devolução
- Validações no frontend e backend
- Interface responsiva e acessível

## Desenvolvimento

Veja `REPORT.md` para detalhes sobre o processo de desenvolvimento, decisões técnicas e documentação das interações com IA.
