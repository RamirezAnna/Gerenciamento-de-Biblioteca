// Configuração inicial
const API_URL = 'http://localhost:8000';
let books = [];
let currentBook = null;

// Verifica autenticação
function checkAuth() {
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    return JSON.parse(userData);
}

// Verifica se o usuário é administrador
function isAdmin() {
    const user = checkAuth();
    return user?.role === 'admin';
}

// Atualiza a interface baseada nas permissões do usuário
function updateUIBasedOnPermissions() {
    const isAdminUser = isAdmin();
    const newBookBtn = document.getElementById('new-book-btn');
    const adminElements = document.querySelectorAll('.admin-only');
    
    if (newBookBtn) {
        newBookBtn.style.display = isAdminUser ? 'flex' : 'none';
    }
    
    adminElements.forEach(el => {
        el.style.display = isAdminUser ? 'flex' : 'none';
    });
}

// Dados de exemplo para teste
const sampleBooks = [
    {
        id: 1,
        titulo: "Dom Casmurro",
        autor: "Machado de Assis",
        ano: 1899,
        genero: "Romance",
        isbn: "9788535910682",
        status: "disponível"
    },
    {
        id: 2,
        titulo: "O Senhor dos Anéis",
        autor: "J.R.R. Tolkien",
        ano: 1954,
        genero: "Ficção",
        isbn: "9788533613379",
        status: "emprestado",
        data_emprestimo: new Date()
    }
];

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
        // Temporariamente usando dados de exemplo
        books = [...sampleBooks];
        renderBooks();
        
        // Código original comentado até o backend estar funcionando
        /*const response = await fetch(`${API_URL}/livros`);
        if (!response.ok) throw new Error('Erro ao buscar livros');
        books = await response.json();
        renderBooks();*/
    } catch (error) {
        console.error('Erro:', error);
        toast.show('Erro ao carregar livros', 'error');
    }
}

function createBookHTML(book) {
    return `
        <div class="book-header">
            <h3>${book.titulo}</h3>
            <span class="book-status status-${book.status === 'disponível' ? 'available' : 'borrowed'}">
                <i class="fas fa-${book.status === 'disponível' ? 'check-circle' : 'clock'}"></i>
                ${book.status}
            </span>
        </div>
        <div class="book-info">
            <p><i class="fas fa-user"></i> <strong>Autor:</strong> ${book.autor}</p>
            <p><i class="fas fa-calendar"></i> <strong>Ano:</strong> ${book.ano}</p>
            <p><i class="fas fa-bookmark"></i> <strong>Gênero:</strong> ${book.genero}</p>
            ${book.isbn ? `<p><i class="fas fa-barcode"></i> <strong>ISBN:</strong> ${book.isbn}</p>` : ''}
            ${book.data_emprestimo ? 
                `<p><i class="fas fa-clock"></i> <strong>Data de Empréstimo:</strong> ${new Date(book.data_emprestimo).toLocaleDateString()}</p>` 
                : ''
            }
        </div>
        <div class="book-actions">
            ${book.status === 'disponível' 
                ? `<button onclick="event.stopPropagation(); emprestar(${book.id})" class="btn-action" aria-label="Emprestar ${book.titulo}">
                    <i class="fas fa-hand-holding"></i> Emprestar
                   </button>`
                : `<button onclick="event.stopPropagation(); devolver(${book.id})" class="btn-action" aria-label="Devolver ${book.titulo}">
                    <i class="fas fa-undo"></i> Devolver
                   </button>`
            }
            <button onclick="event.stopPropagation(); showBookDetails(${book.id})" class="btn-action" aria-label="Ver detalhes">
                <i class="fas fa-info-circle"></i> Ver detalhes
            </button>
        </div>
    `;
}

function renderBooks() {
    const filteredBooks = filterBooks();
    const isAdminUser = isAdmin();
    
    elements.booksGrid.innerHTML = filteredBooks
        .map(book => `
            <div class="book-card">
                <div class="book-header">
                    <h3>${book.titulo}</h3>
                    <span class="book-status status-${book.status === 'disponível' ? 'available' : 'borrowed'}">
                        <i class="fas fa-${book.status === 'disponível' ? 'check-circle' : 'clock'}"></i>
                        ${book.status}
                    </span>
                </div>
                <div class="book-info">
                    <p><i class="fas fa-user"></i> <strong>Autor:</strong> ${book.autor}</p>
                    <p><i class="fas fa-calendar"></i> <strong>Ano:</strong> ${book.ano}</p>
                    <p><i class="fas fa-bookmark"></i> <strong>Gênero:</strong> ${book.genero}</p>
                    ${book.isbn ? `<p><i class="fas fa-barcode"></i> <strong>ISBN:</strong> ${book.isbn}</p>` : ''}
                </div>
                <div class="book-actions">
                    ${isAdminUser ? `
                        <button onclick="editBook(${book.id})" class="btn-action admin-only" aria-label="Editar ${book.titulo}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button onclick="deleteBook(${book.id})" class="btn-action admin-only" aria-label="Excluir ${book.titulo}">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    ` : ''}
                    ${book.status === 'disponível' 
                        ? `<button onclick="emprestar(${book.id})" class="btn-action" aria-label="Emprestar ${book.titulo}">
                            <i class="fas fa-hand-holding"></i> Emprestar
                           </button>`
                        : `<button onclick="devolver(${book.id})" class="btn-action" aria-label="Devolver ${book.titulo}">
                            <i class="fas fa-undo"></i> Devolver
                           </button>`
                    }
                    <button onclick="showBookDetails(${book.id})" class="btn-action" aria-label="Ver detalhes">
                        <i class="fas fa-info-circle"></i> Detalhes
                    </button>
                </div>
            </div>
        `)
        .join('');
        
    // Atualiza a interface baseada nas permissões
    updateUIBasedOnPermissions();
}
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

// Funções do Modal
function showModal() {
    document.body.style.overflow = 'hidden';
    elements.newBookModal.classList.add('active');
    setTimeout(() => {
        document.getElementById('titulo').focus();
    }, 300);
}

function closeModal() {
    document.body.style.overflow = '';
    elements.newBookModal.classList.remove('active');
    elements.bookForm.reset();
}

// Fechar modal ao clicar fora ou pressionar ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeDetailsModal();
    }
});

elements.newBookModal.addEventListener('click', (e) => {
    if (e.target === elements.newBookModal) {
        closeModal();
    }
});

// Animação suave ao adicionar/remover livros
function addBookToGrid(book) {
    const div = document.createElement('div');
    div.className = 'book-card';
    div.style.opacity = '0';
    div.style.transform = 'translateY(20px)';
    
    // Adiciona o HTML do livro
    div.innerHTML = createBookHTML(book);
    
    // Adiciona ao grid
    elements.booksGrid.insertBefore(div, elements.booksGrid.firstChild);
    
    // Força um reflow
    div.offsetHeight;
    
    // Anima a entrada
    div.style.opacity = '1';
    div.style.transform = 'translateY(0)';
}

// Modal event listeners
elements.newBookModal?.querySelector('.cancel')?.addEventListener('click', () => {
    elements.newBookModal.hidden = true;
});

// Função para adicionar novo livro
async function handleBookSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: books.length + 1, // Temporário: gerando ID localmente
        titulo: e.target.titulo.value,
        autor: e.target.autor.value,
        ano: parseInt(e.target.ano.value),
        genero: e.target.genero.value,
        isbn: e.target.isbn.value,
        status: 'disponível'
    };

    try {
        // Temporariamente adicionando localmente
        books.push(formData);
        renderBooks();
        closeModal();
        toast.show('Livro adicionado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro:', error);
        toast.show('Erro ao adicionar livro', 'error');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Verifica autenticação
    const user = checkAuth();
    if (!user) return;

    // Adiciona informações do usuário no header
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.innerHTML = `
        <span class="user-name">
            <i class="fas fa-user"></i>
            ${user.name}
        </span>
        <button onclick="logout()" class="btn-logout" aria-label="Sair">
            <i class="fas fa-sign-out-alt"></i>
        </button>
    `;
    document.querySelector('.header-content').appendChild(userInfo);

    // Inicializar elementos do DOM
    elements.searchInput = document.getElementById('search-input');
    elements.genreFilter = document.getElementById('genre-filter');
    elements.yearFilter = document.getElementById('year-filter');
    elements.statusFilter = document.getElementById('status-filter');
    elements.booksGrid = document.getElementById('books-grid');
    elements.newBookBtn = document.getElementById('new-book-btn');
    elements.newBookModal = document.getElementById('new-book-modal');
    elements.bookForm = document.getElementById('book-form');

    // Configurar ano máximo
    if (elements.yearFilter) {
        elements.yearFilter.max = new Date().getFullYear();
    }

    // Adicionar event listeners
    elements.searchInput?.addEventListener('input', renderBooks);
    elements.genreFilter?.addEventListener('change', renderBooks);
    elements.yearFilter?.addEventListener('input', renderBooks);
    elements.statusFilter?.addEventListener('change', renderBooks);
    elements.newBookBtn?.addEventListener('click', showModal);
    elements.bookForm?.addEventListener('submit', handleBookSubmit);

    // Carregar livros iniciais e mostrar mensagem de boas-vindas
    fetchBooks();
    toast.show('Bem-vindo ao Sistema de Biblioteca!', 'info');
});

// Funções de empréstimo e devolução
async function emprestar(id) {
    try {
        const response = await fetch(`${API_URL}/livros/${id}/emprestar`, {
            method: 'POST'
        });
        
        if (!response.ok) throw new Error('Erro ao emprestar livro');
        
        await fetchBooks();
        toast.show('Livro emprestado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro:', error);
        toast.show('Erro ao emprestar livro', 'error');
    }
}

async function devolver(id) {
    try {
        const response = await fetch(`${API_URL}/livros/${id}/devolver`, {
            method: 'POST'
        });
        
        if (!response.ok) throw new Error('Erro ao devolver livro');
        
        await fetchBooks();
        toast.show('Livro devolvido com sucesso!', 'success');
    } catch (error) {
        console.error('Erro:', error);
        toast.show('Erro ao devolver livro', 'error');
    }
}


