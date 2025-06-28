class PasswordManager {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || '{}');
        this.passwords = [];
        this.categories = [];
        this.locations = [];
        
        this.init();
    }

    init() {
        this.bindEvents();
        
        if (this.token) {
            this.showApp();
            this.loadData();
        } else {
            this.showLogin();
        }
    }

    bindEvents() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Search input
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterPasswords();
        });

        // Category filter
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filterPasswords();
        });

        // New password button
        document.getElementById('newPasswordBtn').addEventListener('click', () => {
            this.showPasswordModal();
        });

        // Password form
        document.getElementById('passwordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePassword();
        });

        // Modal close buttons
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hidePasswordModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hidePasswordModal();
        });

        // Category links in sidebar
        document.querySelectorAll('[data-category]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.getAttribute('data-category');
                document.getElementById('categoryFilter').value = category;
                this.filterPasswords();
            });
        });
    }

    async login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                
                this.showApp();
                this.loadData();
            } else {
                alert(data.error || 'Erro ao fazer login');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            alert('Erro de conexão');
        }
    }

    logout() {
        this.token = null;
        this.user = {};
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.showLogin();
    }

    showLogin() {
        document.getElementById('loginModal').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
    }

    showApp() {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
        
        // Update user info
        document.getElementById('userName').textContent = this.user.username || 'Usuário';
        document.getElementById('headerUserName').textContent = this.user.username || 'Usuário';
        document.getElementById('lastAccess').textContent = new Date().toLocaleString('pt-BR');
    }

    async loadData() {
        await Promise.all([
            this.loadPasswords(),
            this.loadCategories(),
            this.loadLocations()
        ]);
    }

    async loadPasswords() {
        try {
            const response = await fetch('/api/passwords', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                this.passwords = await response.json();
                this.renderPasswords();
            } else {
                throw new Error('Erro ao carregar senhas');
            }
        } catch (error) {
            console.error('Erro ao carregar senhas:', error);
            alert('Erro ao carregar senhas');
        }
    }

    async loadCategories() {
        try {
            const response = await fetch('/api/categories', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                this.categories = await response.json();
                this.populateCategorySelect();
            }
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    }

    async loadLocations() {
        try {
            const response = await fetch('/api/locations', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                this.locations = await response.json();
                this.populateLocationSelect();
            }
        } catch (error) {
            console.error('Erro ao carregar localidades:', error);
        }
    }

    populateCategorySelect() {
        const select = document.getElementById('category');
        select.innerHTML = '<option value="">Selecione uma categoria</option>';
        
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    }

    populateLocationSelect() {
        const select = document.getElementById('location');
        select.innerHTML = '<option value="">Selecione uma localidade</option>';
        
        this.locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location.id;
            option.textContent = location.name;
            select.appendChild(option);
        });
    }

    renderPasswords(passwordsToRender = this.passwords) {
        const tbody = document.getElementById('passwordsTableBody');
        
        if (passwordsToRender.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-key"></i>
                        <p>Nenhuma senha encontrada</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = passwordsToRender.map(password => `
            <tr>
                <td>${password.system}</td>
                <td>${password.location_name || '-'}</td>
                <td>${password.username_credential}</td>
                <td>
                    ${password.url ? `<a href="${password.url}" target="_blank">${password.url}</a>` : '-'}
                </td>
                <td>${new Date(password.last_updated).toLocaleDateString('pt-BR')}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="passwordManager.editPassword(${password.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="passwordManager.deletePassword(${password.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    filterPasswords() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;

        let filtered = this.passwords;

        if (searchTerm) {
            filtered = filtered.filter(password => 
                password.system.toLowerCase().includes(searchTerm) ||
                password.username_credential.toLowerCase().includes(searchTerm) ||
                (password.url && password.url.toLowerCase().includes(searchTerm))
            );
        }

        if (categoryFilter && categoryFilter !== 'all') {
            filtered = filtered.filter(password => 
                password.category_name === categoryFilter
            );
        }

        this.renderPasswords(filtered);
    }

    showPasswordModal(password = null) {
        const modal = document.getElementById('passwordModal');
        const form = document.getElementById('passwordForm');
        const title = document.getElementById('modalTitle');

        if (password) {
            title.textContent = 'Editar Senha';
            document.getElementById('passwordId').value = password.id;
            document.getElementById('system').value = password.system;
            document.getElementById('location').value = password.location_id;
            document.getElementById('category').value = password.category_id;
            document.getElementById('usernameCredential').value = password.username_credential;
            document.getElementById('url').value = password.url || '';
        } else {
            title.textContent = 'Nova Senha';
            form.reset();
            document.getElementById('passwordId').value = '';
        }

        modal.style.display = 'flex';
    }

    hidePasswordModal() {
        document.getElementById('passwordModal').style.display = 'none';
    }

    async savePassword() {
        const form = document.getElementById('passwordForm');
        const formData = new FormData(form);
        const passwordId = document.getElementById('passwordId').value;

        const data = {
            system: formData.get('system'),
            location_id: parseInt(formData.get('location_id')),
            category_id: parseInt(formData.get('category_id')),
            username_credential: formData.get('username_credential'),
            url: formData.get('url') || null
        };

        try {
            const url = passwordId ? `/api/passwords/${passwordId}` : '/api/passwords';
            const method = passwordId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                this.hidePasswordModal();
                this.loadPasswords();
                alert(passwordId ? 'Senha atualizada com sucesso!' : 'Senha criada com sucesso!');
            } else {
                const error = await response.json();
                alert(error.error || 'Erro ao salvar senha');
            }
        } catch (error) {
            console.error('Erro ao salvar senha:', error);
            alert('Erro de conexão');
        }
    }

    editPassword(id) {
        const password = this.passwords.find(p => p.id === id);
        if (password) {
            this.showPasswordModal(password);
        }
    }

    async deletePassword(id) {
        if (!confirm('Tem certeza que deseja excluir esta senha?')) {
            return;
        }

        try {
            const response = await fetch(`/api/passwords/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                this.loadPasswords();
                alert('Senha excluída com sucesso!');
            } else {
                const error = await response.json();
                alert(error.error || 'Erro ao excluir senha');
            }
        } catch (error) {
            console.error('Erro ao excluir senha:', error);
            alert('Erro de conexão');
        }
    }
}

// Initialize the application
const passwordManager = new PasswordManager();

