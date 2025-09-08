// Estrutura de dados para usuários de exemplo
const USERS = [
    {
        id: 1,
        name: 'Administrador',
        email: 'admin@biblioteca.com',
        password: 'admin123',
        role: 'admin'
    },
    {
        id: 2,
        name: 'Usuário Teste',
        email: 'usuario@teste.com',
        password: 'user123',
        role: 'user'
    }
];

// Usuário atual
let currentUser = null;

// Verifica se já existe um usuário logado
function checkAuth() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        currentUser = JSON.parse(userData);
        redirectToApp();
    }
}

// Função para login
async function login(email, password) {
    // Simula uma chamada à API
    const user = USERS.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Remove a senha antes de salvar
        const { password, ...userWithoutPassword } = user;
        currentUser = userWithoutPassword;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        return true;
    }
    return false;
}

// Função para logout
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Função para registro (simulada)
async function register(userData) {
    // Verifica se o email já está em uso
    if (USERS.some(u => u.email === userData.email)) {
        throw new Error('Email já cadastrado');
    }

    // Simula criação de novo usuário
    const newUser = {
        id: USERS.length + 1,
        ...userData,
        role: 'user' // Novos registros são sempre usuários comuns
    };

    USERS.push(newUser);
    return true;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Se estiver na página principal, verifica autenticação
    if (window.location.pathname.endsWith('index.html')) {
        const user = checkAuth();
        if (!user) return;
    }

    // Se estiver na página de login
    if (window.location.pathname.endsWith('login.html')) {
        const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = e.target.email.value;
            const password = e.target.password.value;
            const remember = e.target.remember.checked;

            try {
                const success = await login(email, password);
                if (success) {
                    if (remember) {
                        localStorage.setItem('rememberMe', 'true');
                    }
                    redirectToApp();
                } else {
                    toast.show('Email ou senha incorretos', 'error');
                }
            } catch (error) {
                toast.show('Erro ao fazer login', 'error');
            }
        });
    }

    // Form de Registro
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = e.target.name.value;
            const email = e.target.email.value;
            const password = e.target.password.value;
            const confirmPassword = e.target['confirm-password'].value;

            if (password !== confirmPassword) {
                toast.show('As senhas não coincidem', 'error');
                return;
            }

            try {
                await register({ name, email, password });
                toast.show('Conta criada com sucesso!', 'success');
                closeRegisterModal();
                // Limpa o formulário
                registerForm.reset();
            } catch (error) {
                toast.show(error.message, 'error');
            }
        });
    }

    // Botão de Registro
    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openRegisterModal();
        });
    }

    // Toggle Password Visibility
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const input = e.target.closest('.password-input').querySelector('input');
            const icon = e.target.closest('.toggle-password').querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });
});

// Funções auxiliares
function openRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function redirectToApp() {
    if (!currentUser) return;
    window.location.href = 'index.html';
}
