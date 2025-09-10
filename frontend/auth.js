const API_URL = 'http://localhost:5000';

// Verifica se já existe um usuário logado
function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        redirectToApp();
    }
}

// Função para login
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.access_token);
            return true;
        } else {
            throw new Error(data.detail || 'Erro ao fazer login');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        return false;
    }
}

// Função para logout
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Função para registro
async function register(userData) {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            // Mostra mensagem de sucesso
            showToast('Cadastro realizado com sucesso! Por favor, faça login.', 'success');
            // Redireciona para a página de login após 2 segundos
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return true;
        } else {
            throw new Error(data.detail || 'Erro ao registrar');
        }
    } catch (error) {
        throw error;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Se estiver na página de login, já está logado redireciona
    if (window.location.pathname.endsWith('login.html')) {
        if (localStorage.getItem('token')) {
            window.location.href = 'index.html';
            return;
        }
        
        // Configura o formulário de login
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
                    showToast('Login realizado com sucesso!', 'success');
                    // Redireciona para a biblioteca após o login
                    window.location.href = 'index.html';
                } else {
                    showToast('Email ou senha incorretos', 'error');
                }
            } catch (error) {
                showToast('Erro ao fazer login', 'error');
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
                showToast('As senhas não coincidem', 'error');
                return;
            }

            try {
                await register({ name, email, password });
            } catch (error) {
                showToast(error.message || 'Erro ao criar conta', 'error');
            }
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
            const modal = document.getElementById('register-modal');
            if (modal) {
                modal.classList.add('active');
            }
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
        // Limpa o formulário quando fechar
        document.getElementById('register-form').reset();
    }
}

function redirectToApp() {
    if (!currentUser) return;
    window.location.href = 'index.html';
}
