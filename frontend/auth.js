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

function loginUser(email, password) {
    const users = getAllUsers();
    const found = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase() && u.password === password);
    if (!found) return null;
    const safe = { id: found.id, name: found.name, email: found.email, role: found.role };
    localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(safe));
    return safe;
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
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = (e.target.email?.value || '').trim();
            const password = (e.target.password?.value || '').trim();
            const remember = e.target.remember?.checked;
            const user = loginUser(email, password);
            if (user) {
                if (remember) localStorage.setItem('rememberMe', 'true');
                notify('Login realizado com sucesso!', 'success');
                setTimeout(() => window.location.href = 'index.html', 500);
            } else {
                notify('Email ou senha incorretos', 'error');
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
