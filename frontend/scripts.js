// Configuração inicial
const API_URL = 'http://localhost:8000';
let books = [];

// Cache de elementos DOM
const elements = {
    searchInput: document.getElementById('search-input'),
    genreFilter: document.getElementById('genre-filter'),
    yearFilter: document.getElementById('year-filter'),
    statusFilter: document.getElementById('status-filter'),
    booksGrid: document.getElementById('books-grid'),
    newBookBtn: document.getElementById('new-book-btn'),
    newBookModal: document.getElementById('new-book-modal'),
    bookForm: document.getElementById('book-form')
};

// Configuração do ano máximo
elements.yearFilter.max = new Date().getFullYear();

// Handlers
async function fetchBooks() {
    try {
        const response = await fetch(`${API_URL}/livros`);
        if (!response.ok) throw new Error('Erro ao buscar livros');
        books = await response.json();
        renderBooks();
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao carregar livros', 'error');
    }
}

function renderBooks() {
    const filteredBooks = filterBooks();
    elements.booksGrid.innerHTML = filteredBooks
        .map(book => `
            <div class="book-card">
                <h3>${book.titulo}</h3>
                <p>Autor: ${book.autor}</p>
                <p>Ano: ${book.ano}</p>
                <p>Gênero: ${book.genero}</p>
                <span class="book-status status-${book.status === 'disponível' ? 'available' : 'borrowed'}">
                    ${book.status}
                </span>
                <div class="book-actions">
                    ${book.status === 'disponível' 
                        ? `<button onclick="emprestar(${book.id})" aria-label="Emprestar ${book.titulo}">Emprestar</button>`
                        : `<button onclick="devolver(${book.id})" aria-label="Devolver ${book.titulo}">Devolver</button>`
                    }
                </div>
            </div>
        `)
        .join('');
}

function filterBooks() {
    return books.filter(book => {
        const matchesSearch = book.titulo.toLowerCase().includes(elements.searchInput.value.toLowerCase()) ||
                            book.autor.toLowerCase().includes(elements.searchInput.value.toLowerCase());
        const matchesGenre = !elements.genreFilter.value || book.genero === elements.genreFilter.value;
        const matchesYear = !elements.yearFilter.value || book.ano === parseInt(elements.yearFilter.value);
        const matchesStatus = !elements.statusFilter.value || book.status === elements.statusFilter.value;
        
        return matchesSearch && matchesGenre && matchesYear && matchesStatus;
    });
}

// Event Listeners
elements.searchInput.addEventListener('input', renderBooks);
elements.genreFilter.addEventListener('change', renderBooks);
elements.yearFilter.addEventListener('input', renderBooks);
elements.statusFilter.addEventListener('change', renderBooks);

elements.newBookBtn.addEventListener('click', () => {
    elements.newBookModal.hidden = false;
    document.getElementById('title').focus();
});

elements.newBookModal.querySelector('.cancel').addEventListener('click', () => {
    elements.newBookModal.hidden = true;
});

elements.bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        titulo: e.target.title.value,
        autor: e.target.author.value,
        ano: parseInt(e.target.year.value),
        genero: e.target.genre.value,
        isbn: e.target.isbn.value,
        status: 'disponível'
    };

    try {
        const response = await fetch(`${API_URL}/livros`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Erro ao cadastrar livro');

        elements.bookForm.reset();
        elements.newBookModal.hidden = true;
        await fetchBooks();
        showToast('Livro cadastrado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao cadastrar livro', 'error');
    }
});

// Funções de empréstimo e devolução
async function emprestar(id) {
    try {
        const response = await fetch(`${API_URL}/livros/${id}/emprestar`, {
            method: 'POST'
        });
        
        if (!response.ok) throw new Error('Erro ao emprestar livro');
        
        await fetchBooks();
        showToast('Livro emprestado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao emprestar livro', 'error');
    }
}

async function devolver(id) {
    try {
        const response = await fetch(`${API_URL}/livros/${id}/devolver`, {
            method: 'POST'
        });
        
        if (!response.ok) throw new Error('Erro ao devolver livro');
        
        await fetchBooks();
        showToast('Livro devolvido com sucesso!', 'success');
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao devolver livro', 'error');
    }
}

// Função auxiliar para mostrar mensagens de feedback
function showToast(message, type) {
    // Implementar sistema de toast/notificação
    alert(message);
}

// Inicialização
document.addEventListener('DOMContentLoaded', fetchBooks);
