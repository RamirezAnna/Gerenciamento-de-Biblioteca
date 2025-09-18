// Configuração inicial
const API_URL = 'http://localhost:8000';
let books = [];
let currentBook = null;

// Verifica autenticação usando auth.getCurrentUser
function checkAuth() {
    return window.auth?.getCurrentUser();
}

// Verifica se o usuário é funcionário
function isStaff() {
    const user = checkAuth();
    return user?.role === 'staff';
}

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
    ,
    {
        id: 3,
        titulo: "O Pequeno Príncipe",
        autor: "Antoine de Saint-Exupéry",
        ano: 1943,
        genero: "Infantil",
        isbn: "9782070612758",
        status: "disponível"
    },
    {
        id: 4,
        titulo: "1984",
        autor: "George Orwell",
        ano: 1949,
        genero: "Ficção",
        isbn: "9788535914849",
        status: "disponível"
    },
    {
        id: 5,
        titulo: "Cem Anos de Solidão",
        autor: "Gabriel García Márquez",
        ano: 1967,
        genero: "Realismo Mágico",
        isbn: "9780307474728",
        status: "disponível"
    },
    {
        id: 6,
        titulo: "O Hobbit",
        autor: "J.R.R. Tolkien",
        ano: 1937,
        genero: "Fantasia",
        isbn: "9780261103344",
        status: "disponível"
    },
    {
        id: 7,
        titulo: "A Menina que Roubava Livros",
        autor: "Markus Zusak",
        ano: 2005,
        genero: "Histórico",
        isbn: "9780375842207",
        status: "disponível"
    },
    {
        id: 8,
        titulo: "O Alquimista",
        autor: "Paulo Coelho",
        ano: 1988,
        genero: "Ficção",
        isbn: "9780061122415",
        status: "disponível"
    },
    {
        id: 9,
        titulo: "A Revolução dos Bichos",
        autor: "George Orwell",
        ano: 1945,
        genero: "Sátira",
        isbn: "9780141036137",
        status: "disponível"
    },
    {
        id: 10,
        titulo: "Memórias Póstumas de Brás Cubas",
        autor: "Machado de Assis",
        ano: 1881,
        genero: "Romance",
        isbn: "9788520926509",
        status: "disponível"
    },
    {
        id: 11,
        titulo: "O Código Da Vinci",
        autor: "Dan Brown",
        ano: 2003,
        genero: "Thriller",
        isbn: "9780307474278",
        status: "disponível"
    },
    {
        id: 12,
        titulo: "O Guia do Mochileiro das Galáxias",
        autor: "Douglas Adams",
        ano: 1979,
        genero: "Ficção Científica",
        isbn: "9780345391803",
        status: "disponível"
    },
    {
        id: 13,
        titulo: "Grande Sertão: Veredas",
        autor: "João Guimarães Rosa",
        ano: 1956,
        genero: "Regional",
        isbn: "9788535909724",
        status: "disponível"
    },
    {
        id: 14,
        titulo: "Ensaio sobre a Cegueira",
        autor: "José Saramago",
        ano: 1995,
        genero: "Ficção",
        isbn: "9780156007757",
        status: "disponível"
    },
    {
        id: 15,
        titulo: "O Morro dos Ventos Uivantes",
        autor: "Emily Brontë",
        ano: 1847,
        genero: "Romance",
        isbn: "9780141439556",
        status: "disponível"
    },
    {
        id: 16,
        titulo: "A Sangue Frio",
        autor: "Truman Capote",
        ano: 1966,
        genero: "True Crime",
        isbn: "9780679745587",
        status: "disponível"
    },
    {
        id: 17,
        titulo: "Sapiens: Uma Breve História da Humanidade",
        autor: "Yuval Noah Harari",
        ano: 2011,
        genero: "Não-Ficção",
        isbn: "9780062316097",
        status: "disponível"
    },
    {
        id: 18,
        titulo: "O Processo",
        autor: "Franz Kafka",
        ano: 1925,
        genero: "Ficção",
        isbn: "9780141182605",
        status: "disponível"
    },
    {
        id: 19,
        titulo: "Pride and Prejudice",
        autor: "Jane Austen",
        ano: 1813,
        genero: "Romance",
        isbn: "9780141040349",
        status: "disponível"
    },
    {
        id: 20,
        titulo: "Thinking, Fast and Slow",
        autor: "Daniel Kahneman",
        ano: 2011,
        genero: "Psicologia",
        isbn: "9780374533557",
        status: "disponível"
    }
];

// Cache de elementos DOM (inicializados após DOMContentLoaded)
const elements = {
    searchInput: null,
    genreFilter: null,
    yearFilter: null,
    statusFilter: null,
    booksGrid: null,
    newBookBtn: null,
    newBookModal: null,
    bookForm: null
};

// Handlers
async function fetchBooks() {
    try {
        // Temporariamente usando dados de exemplo
        books = [...sampleBooks];
        renderBooks();
    } catch (error) {
        console.error('Erro:', error);
        if (window.toast) window.toast.show('Erro ao carregar livros', 'error');
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
    
    // Ordena os livros por título
    filteredBooks.sort((a, b) => a.titulo.localeCompare(b.titulo));
    
    if (!elements.booksGrid) return;

    if (filteredBooks.length === 0) {
        elements.booksGrid.innerHTML = `
            <div class="no-results">
                <img src="https://cdn.jsdelivr.net/gh/RamirezAnna/Gerenciamento-de-Biblioteca@main/frontend/assets/not-found.svg" 
                     alt="Nenhum livro encontrado"
                     class="not-found-image">
                <p>Não encontrado</p>
            </div>
        `;
        return;
    }
    
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

function filterBooks() {
    const searchValue = elements.searchInput?.value?.toLowerCase() || '';
    return books.filter(book => {
        const matchesSearch = book.titulo.toLowerCase().includes(searchValue) ||
                            book.autor.toLowerCase().includes(searchValue);
        const matchesGenre = !elements.genreFilter?.value || book.genero === elements.genreFilter.value;
        const matchesYear = !elements.yearFilter?.value || book.ano === parseInt(elements.yearFilter.value);
        const matchesStatus = !elements.statusFilter?.value || book.status === elements.statusFilter.value;
        
        return matchesSearch && matchesGenre && matchesYear && matchesStatus;
    });
}

// Funções do Modal
function showModal() {
    document.body.style.overflow = 'hidden';
    elements.newBookModal.classList.add('active');
    setTimeout(() => {
        document.getElementById('titulo')?.focus();
    }, 300);
}

function closeModal() {
    document.body.style.overflow = '';
    elements.newBookModal.classList.remove('active');
    elements.bookForm?.reset();
}

// Fechar modal ao clicar fora ou pressionar ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeDetailsModal?.();
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
        if (window.toast) window.toast.show('Livro adicionado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro:', error);
        if (window.toast) window.toast.show('Erro ao adicionar livro', 'error');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Verifica autenticação
    const user = window.auth?.getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Adiciona informações do usuário no header
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.innerHTML = `
        <span class="user-name">
            <i class="fas fa-user"></i>
            ${user.name}
        </span>
        <button id="manage-users-btn" class="btn-manage-users" style="display: ${user.role === 'admin' ? 'inline-flex' : 'none'}; margin-left:8px;" aria-label="Gerenciar usuários">
            <i class="fas fa-users-cog"></i>
        </button>
        <button id="logout-btn" class="btn-logout" aria-label="Sair" style="margin-left:8px;">
            <i class="fas fa-sign-out-alt"></i>
        </button>
    `;
    document.querySelector('.header-content').appendChild(userInfo);

    document.getElementById('logout-btn')?.addEventListener('click', () => {
        window.auth.logout();
    });

    document.getElementById('manage-users-btn')?.addEventListener('click', () => {
        window.location.href = 'manage_users.html';
    });

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
    if (window.toast) window.toast.show('Bem-vindo ao Sistema de Biblioteca!', 'info');
});

// Funções de empréstimo e devolução (simuladas)
async function emprestar(id) {
    try {
        const bk = books.find(b => b.id === id);
        if (bk) {
            bk.status = 'emprestado';
            bk.data_emprestimo = new Date().toISOString();
            renderBooks();
            if (window.toast) window.toast.show('Livro emprestado com sucesso!', 'success');
        }
    } catch (error) {
        console.error('Erro:', error);
        if (window.toast) window.toast.show('Erro ao emprestar livro', 'error');
    }
}

async function devolver(id) {
    try {
        const bk = books.find(b => b.id === id);
        if (bk) {
            bk.status = 'disponível';
            delete bk.data_emprestimo;
            renderBooks();
            if (window.toast) window.toast.show('Livro devolvido com sucesso!', 'success');
        }
    } catch (error) {
        console.error('Erro:', error);
        if (window.toast) window.toast.show('Erro ao devolver livro', 'error');
    }
}


