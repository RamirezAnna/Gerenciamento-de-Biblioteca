const STORAGE_USERS_KEY = 'users';
const STORAGE_CURRENT_USER = 'currentUser';

function notify(message, type = 'info') {
    if (typeof showToast === 'function') {
        showToast(message, type);
    } else if (window.toast && typeof window.toast.show === 'function') {
        window.toast.show(message, type);
    } else {
        console[type === 'error' ? 'error' : 'log'](message);
    }
}

function getAllUsers() {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
}

function saveAllUsers(users) {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

function ensureAdminUser() {
    let users = getAllUsers();
    if (!users.find(u => u.role === 'admin')) {
        const admin = {
            id: Date.now(),
            name: 'Administrador',
            email: 'admin@biblioteca.com',
            password: 'admin123', // senha inicial; trocar em produção
            role: 'admin'
        };
        users.push(admin);
        saveAllUsers(users);
        console.log('Usuário admin criado (email: admin@biblioteca.com, senha: admin123)');
    }
}

function detectRoleFromEmail(email) {
    if (!email) return 'client';
    if (email === 'admin@biblioteca.com') return 'admin';
    // Regra simples: '_' => cliente, '.' => funcionário
    if (email.includes('_')) return 'client';
    if (email.includes('.')) return 'staff';
    return 'client';
}

function registerUser({ name, email, password }) {
    if (!email || !password || !name) throw new Error('Nome, email e senha são obrigatórios');
    let users = getAllUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Usuário já cadastrado');
    }
    const role = detectRoleFromEmail(email.toLowerCase());
    const user = { id: Date.now(), name, email: email.toLowerCase(), password, role };
    users.push(user);
    saveAllUsers(users);
    return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// Retorna um objeto com sucesso/razão para permitir mensagens mais precisas
function authenticateUser(email, password) {
    const users = getAllUsers();
    const foundByEmail = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    if (!foundByEmail) {
        return { success: false, reason: 'no_user' };
    }
    if (foundByEmail.password !== password) {
        return { success: false, reason: 'wrong_password' };
    }
    const safe = { id: foundByEmail.id, name: foundByEmail.name, email: foundByEmail.email, role: foundByEmail.role };
    localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(safe));
    return { success: true, user: safe };
}

// Compatibilidade com código anterior: loginUser retorna o usuário ou null
function loginUser(email, password) {
    const res = authenticateUser(email, password);
    return res.success ? res.user : null;
}

function logout() {
    localStorage.removeItem(STORAGE_CURRENT_USER);
    window.location.href = 'login.html';
}

function getCurrentUser() {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
}

function requireAuth(redirectTo = 'login.html') {
    const user = getCurrentUser();
    if (!user) window.location.href = redirectTo;
    return user;
}

function updateUserRole(userId, newRole) {
    const users = getAllUsers();
    const u = users.find(x => x.id === userId);
    if (!u) throw new Error('Usuário não encontrado');
    u.role = newRole;
    saveAllUsers(users);
}

function deleteUser(userId) {
    let users = getAllUsers();
    users = users.filter(u => u.id !== userId);
    saveAllUsers(users);
}

// Inicializa o sistema (cria admin se precisar)
ensureAdminUser();

// DOM helpers: conecta formulários de login/registro quando presentes
document.addEventListener('DOMContentLoaded', () => {
    
    // Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = (e.target.email?.value || '').trim();
            const password = (e.target.password?.value || '').trim();

            // Get reCAPTCHA token
            const token = (window.grecaptcha && grecaptcha.getResponse && grecaptcha.getResponse()) || '';
            if (!token) {
                notify('Por favor, confirme que não é um robô antes de prosseguir.', 'error');
                return;
            }

            try {
                // Verify token server-side
                const verifyResp = await fetch('/verify-recaptcha', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });
                const verifyData = await verifyResp.json();
                if (!verifyResp.ok || !verifyData.success) {
                    notify('Falha na verificação do reCAPTCHA. Tente novamente.', 'error');
                    // Reset grecaptcha
                    try { grecaptcha.reset(); } catch (e) {}
                    return;
                }
            } catch (err) {
                console.error('Erro ao verificar reCAPTCHA:', err);
                notify('Erro na verificação do reCAPTCHA. Tente novamente.', 'error');
                return;
            }

            // Após verificação do reCAPTCHA, prossegue com autenticação local (para desenvolvimento)
            const res = authenticateUser(email, password);
            if (res.success) {
                if (remember) localStorage.setItem('rememberMe', 'true');
                notify('Login realizado com sucesso!', 'success');
                setTimeout(() => window.location.href = 'index.html', 500);
            } else {
                // Se o email não existir, exibe mensagem específica; senão, mensagem genérica
                if (res.reason === 'no_user') {
                    notify('O usuário informado não foi encontrado.', 'error');
                } else {
                    notify('Credenciais inválidas — verifique o e‑mail e a senha.', 'error');
                }
            }
        });
    }

    // Registro
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name')?.value?.trim();
            const email = document.getElementById('reg-email')?.value?.trim();
            const password = document.getElementById('reg-password')?.value;
            const confirm = document.getElementById('reg-confirm-password')?.value;
            if (password !== confirm) { notify('As senhas não coincidem', 'error'); return; }
            try {
                registerUser({ name, email, password });
                notify('Cadastro realizado com sucesso! Redirecionando para login...', 'success');
                setTimeout(() => window.location.href = 'login.html', 1200);
            } catch (err) {
                notify(err.message || 'Erro ao cadastrar', 'error');
            }
        });
    }

    // Toggle Password Visibility (login & register)
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const wrapper = e.target.closest('.password-input') || e.target.parentElement;
            const input = wrapper?.querySelector('input');
            const icon = btn.querySelector('i');
            if (!input) return;
            if (input.type === 'password') {
                input.type = 'text';
                if (icon) icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                if (icon) icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });
});

// Exporta utilitários globalmente para outras partes do app
window.auth = {
    getAllUsers,
    getCurrentUser,
    loginUser,
    logout,
    registerUser,
    requireAuth,
    updateUserRole,
    deleteUser
};

// Atalhos globais (compatibilidade)
window.getAllUsers = getAllUsers;
window.getCurrentUser = getCurrentUser;
window.loginUser = loginUser;
window.logout = logout;
window.registerUser = registerUser;
window.updateUserRole = updateUserRole;
window.deleteUser = deleteUser;
