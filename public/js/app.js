// Configuração da API
const API_BASE_URL = window.location.origin + '/api';

// Estado global da aplicação
let currentUser = null;
let authToken = null;
let passwords = [];
let users = [];
let locations = [];

// Utilitários
const showNotification = (message, type = 'info') => {
  // Implementação simples de notificação
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 
    type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
  }`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 5000);
};

// Funções de API
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição');
    }
    
    return data;
  } catch (error) {
    console.error('Erro na API:', error);
    throw error;
  }
};

// Autenticação
const login = async (email, senha) => {
  try {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha })
    });
    
    authToken = response.data.token;
    currentUser = response.data.user;
    
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    return response;
  } catch (error) {
    throw error;
  }
};

const logout = async () => {
  try {
    if (authToken) {
      await apiCall('/auth/logout', { method: 'POST' });
    }
  } catch (error) {
    console.error('Erro no logout:', error);
  } finally {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.reload();
  }
};

const checkAuth = () => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('currentUser');
  
  if (token && user) {
    authToken = token;
    currentUser = JSON.parse(user);
    return true;
  }
  
  return false;
};

// Funções de dados
const loadPasswords = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiCall(`/passwords?${queryParams}`);
    passwords = response.data;
    renderPasswordTable();
    return passwords;
  } catch (error) {
    showNotification('Erro ao carregar senhas: ' + error.message, 'error');
    throw error;
  }
};

const loadUsers = async () => {
  try {
    const response = await apiCall('/users');
    users = response.data;
    renderUserTable();
    return users;
  } catch (error) {
    showNotification('Erro ao carregar usuários: ' + error.message, 'error');
    throw error;
  }
};

const loadLocations = async () => {
  try {
    const response = await apiCall('/locations');
    locations = response.data;
    return locations;
  } catch (error) {
    showNotification('Erro ao carregar localidades: ' + error.message, 'error');
    throw error;
  }
};

const loadStats = async () => {
  try {
    const response = await apiCall('/passwords/stats');
    updateDashboardStats(response.data);
    return response.data;
  } catch (error) {
    showNotification('Erro ao carregar estatísticas: ' + error.message, 'error');
    throw error;
  }
};

// Renderização
const renderPasswordTable = () => {
  const tbody = document.getElementById('passwordTableBody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  passwords.forEach(password => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50';
    
    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm font-medium text-gray-900">${password.sistema}</div>
        <div class="text-sm text-gray-500">${password.categoria}</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ${password.localidade_nome || 'N/A'}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ${password.usuario}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
        ${password.url ? `<a href="${password.url}" target="_blank" class="hover:underline">${password.url}</a>` : 'N/A'}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${new Date(password.data_criacao).toLocaleDateString('pt-BR')}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button onclick="viewPassword(${password.id})" class="text-blue-600 hover:text-blue-900 mr-3">
          <i class="fas fa-eye"></i>
        </button>
        ${currentUser.tipo_usuario === 'admin' ? `
          <button onclick="editPassword(${password.id})" class="text-yellow-600 hover:text-yellow-900 mr-3">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="deletePassword(${password.id})" class="text-red-600 hover:text-red-900">
            <i class="fas fa-trash"></i>
          </button>
        ` : ''}
      </td>
    `;
    
    tbody.appendChild(row);
  });
};

const renderUserTable = () => {
  const tbody = document.getElementById('userTableBody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  users.forEach(user => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50';
    
    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm font-medium text-gray-900">${user.nome}</div>
        <div class="text-sm text-gray-500">${user.email}</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          user.tipo_usuario === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
        }">
          ${user.tipo_usuario}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ${user.localidade_nome || 'N/A'}
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          user.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }">
          ${user.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${new Date(user.data_criacao).toLocaleDateString('pt-BR')}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button onclick="editUser(${user.id})" class="text-yellow-600 hover:text-yellow-900 mr-3">
          <i class="fas fa-edit"></i>
        </button>
        ${user.id !== currentUser.id ? `
          <button onclick="deleteUser(${user.id})" class="text-red-600 hover:text-red-900">
            <i class="fas fa-trash"></i>
          </button>
        ` : ''}
      </td>
    `;
    
    tbody.appendChild(row);
  });
};

const updateDashboardStats = (stats) => {
  // Atualizar cards do dashboard com as estatísticas
  const elements = {
    total: document.querySelector('[data-stat="total"]'),
    prefeituras: document.querySelector('[data-stat="prefeituras"]'),
    fornecedores: document.querySelector('[data-stat="fornecedores"]'),
    users: document.querySelector('[data-stat="users"]')
  };
  
  if (elements.total) elements.total.textContent = stats.total || 0;
  if (elements.prefeituras) elements.prefeituras.textContent = stats.prefeituras || 0;
  if (elements.fornecedores) elements.fornecedores.textContent = stats.fornecedores || 0;
};

// Funções de modal e formulários
const openPasswordModal = (passwordId = null) => {
  // Implementar modal de senha
  console.log('Abrir modal de senha:', passwordId);
};

const viewPassword = async (id) => {
  try {
    const response = await apiCall(`/passwords/${id}`);
    const password = response.data;
    
    // Mostrar modal com detalhes da senha
    alert(`Sistema: ${password.sistema}\nUsuário: ${password.usuario}\nSenha: ${password.senha}`);
  } catch (error) {
    showNotification('Erro ao visualizar senha: ' + error.message, 'error');
  }
};

const editPassword = (id) => {
  console.log('Editar senha:', id);
  // Implementar edição de senha
};

const deletePassword = async (id) => {
  if (!confirm('Tem certeza que deseja deletar esta senha?')) return;
  
  try {
    await apiCall(`/passwords/${id}`, { method: 'DELETE' });
    showNotification('Senha deletada com sucesso', 'success');
    loadPasswords();
  } catch (error) {
    showNotification('Erro ao deletar senha: ' + error.message, 'error');
  }
};

const editUser = (id) => {
  console.log('Editar usuário:', id);
  // Implementar edição de usuário
};

const deleteUser = async (id) => {
  if (!confirm('Tem certeza que deseja deletar este usuário?')) return;
  
  try {
    await apiCall(`/users/${id}`, { method: 'DELETE' });
    showNotification('Usuário deletado com sucesso', 'success');
    loadUsers();
  } catch (error) {
    showNotification('Erro ao deletar usuário: ' + error.message, 'error');
  }
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  // Verificar autenticação
  if (!checkAuth()) {
    // Redirecionar para login ou mostrar modal de login
    showLoginModal();
    return;
  }
  
  // Atualizar interface com dados do usuário
  updateUserInterface();
  
  // Carregar dados iniciais
  loadInitialData();
  
  // Configurar event listeners
  setupEventListeners();
});

const showLoginModal = () => {
  // Criar modal de login simples
  const loginModal = document.createElement('div');
  loginModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  loginModal.innerHTML = `
    <div class="bg-white p-8 rounded-lg shadow-lg w-96">
      <h2 class="text-2xl font-bold mb-6 text-center">Login - Cofre Campneus</h2>
      <form id="loginForm">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">Email:</label>
          <input type="email" id="loginEmail" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-yellow-500" required>
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2">Senha:</label>
          <input type="password" id="loginPassword" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-yellow-500" required>
        </div>
        <button type="submit" class="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg">
          Entrar
        </button>
      </form>
    </div>
  `;
  
  document.body.appendChild(loginModal);
  
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const senha = document.getElementById('loginPassword').value;
    
    try {
      await login(email, senha);
      loginModal.remove();
      updateUserInterface();
      loadInitialData();
      setupEventListeners();
    } catch (error) {
      showNotification('Erro no login: ' + error.message, 'error');
    }
  });
};

const updateUserInterface = () => {
  if (!currentUser) return;
  
  // Atualizar nome do usuário na interface
  const userNameElements = document.querySelectorAll('#userName, [data-user-name]');
  userNameElements.forEach(el => el.textContent = currentUser.nome);
  
  // Atualizar tipo de usuário
  const userTypeElements = document.querySelectorAll('[data-user-type]');
  userTypeElements.forEach(el => el.textContent = currentUser.tipo_usuario);
  
  // Mostrar/ocultar elementos baseado no tipo de usuário
  if (currentUser.tipo_usuario !== 'admin') {
    const adminOnlyElements = document.querySelectorAll('[data-admin-only]');
    adminOnlyElements.forEach(el => el.style.display = 'none');
  }
};

const loadInitialData = async () => {
  try {
    await Promise.all([
      loadLocations(),
      loadStats(),
      loadPasswords()
    ]);
    
    if (currentUser.tipo_usuario === 'admin') {
      await loadUsers();
    }
  } catch (error) {
    console.error('Erro ao carregar dados iniciais:', error);
  }
};

const setupEventListeners = () => {
  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  
  // Toggle sidebar
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
      sidebarOverlay.classList.toggle('hidden');
    });
  }
  
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.add('-translate-x-full');
      sidebarOverlay.classList.add('hidden');
    });
  }
};

// Funções globais para o HTML
window.showSection = (section) => {
  // Ocultar todas as seções
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(s => s.classList.add('hidden'));
  
  // Mostrar seção selecionada
  const targetSection = document.getElementById(section + 'Section');
  if (targetSection) {
    targetSection.classList.remove('hidden');
  }
  
  // Atualizar menu ativo
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => item.classList.remove('active'));
  
  // Carregar dados específicos da seção
  switch (section) {
    case 'home':
      loadStats();
      break;
    case 'password':
      loadPasswords();
      break;
    case 'users':
      if (currentUser.tipo_usuario === 'admin') {
        loadUsers();
      }
      break;
    case 'locations':
      loadLocations();
      break;
  }
};

window.showPasswordSection = (categoria) => {
  showSection('password');
  loadPasswords({ categoria });
  
  const subtitle = document.getElementById('passwordSectionSubtitle');
  if (subtitle) {
    const categoriaNames = {
      'prefeituras': 'Prefeituras',
      'fornecedores': 'Fornecedores',
      'orgaos': 'Órgãos Governamentais',
      'b2fleet': 'B2Fleet e Locadoras'
    };
    subtitle.textContent = `Senhas de ${categoriaNames[categoria] || categoria}`;
  }
};

window.toggleSubmenu = (submenuId) => {
  const submenu = document.getElementById(submenuId);
  const chevron = document.getElementById(submenuId.replace('Submenu', 'Chevron'));
  
  if (submenu) {
    submenu.classList.toggle('hidden');
    if (chevron) {
      chevron.classList.toggle('rotate-180');
    }
  }
};

window.openPasswordModal = openPasswordModal;
window.viewPassword = viewPassword;
window.editPassword = editPassword;
window.deletePassword = deletePassword;
window.editUser = editUser;
window.deleteUser = deleteUser;

