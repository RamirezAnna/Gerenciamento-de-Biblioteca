# Relatório Técnico - Biblioteca Escolar

## Arquitetura

```
[Frontend] → [FastAPI] → [SQLAlchemy] → [SQLite]
    ↑           ↓           ↓             ↓
    └── HTTP → [Rotas] → [Models] → [Database]
```

## Tecnologias e Versões

- Python 3.8+
- FastAPI 0.68.1
- SQLAlchemy 1.4.23
- SQLite 3
- HTML5/CSS3/JavaScript ES6+

## Peculiaridades Implementadas

1. Acessibilidade:
   - ARIA labels
   - Contraste adequado (4.5:1+)
   - Navegação por teclado
   - Feedback visual de foco

2. Validações:
   Frontend:
   - Título: 3-90 caracteres
   - Ano: 1900-atual
   - Status: disponível/emprestado

   Backend:
   - Validações via Pydantic
   - Status válidos
   - Datas coerentes

3. Filtro avançado:
   - Combinação de critérios
   - Busca em tempo real
   - Sem reload da página

## Como Rodar

1. Backend:
```bash
cd backend
pip install -r requirements.txt
python seed.py
uvicorn app:app --reload
```

2. Frontend:
- Abrir `frontend/index.html` no navegador

## Limitações e Melhorias Futuras

- Implementar autenticação
- Adicionar sistema de reservas
- Melhorar UX mobile
- Adicionar testes automatizados
- Implementar cache de consultas frequentes
