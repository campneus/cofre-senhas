// public/js/main.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    initializeTooltips();
    
    // Update last access time in the header
    updateLastAccess();
    
    // Initialize password visibility toggles
    initializePasswordToggles();
    
    // Setup sidebar functionality
    setupSidebar();
    
    // Setup form validation
    setupFormValidation();
    
    // Initialize modal functionality
    setupModals();
});

// Last access time update
function updateLastAccess() {
    const lastAccessElement = document.getElementById('lastAccess');
    if (lastAccessElement) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('pt-BR');
        const timeStr = now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
        lastAccessElement.textContent = `Último acesso: ${dateStr} ${timeStr}`;
    }
}

// Password visibility toggle
function initializePasswordToggles() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    });
}

// Sidebar functionality
function setupSidebar() {
    // Toggle submenu
    const submenuToggles = document.querySelectorAll('[data-toggle="submenu"]');
    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const submenuId = this.getAttribute('data-target');
            const submenu = document.getElementById(submenuId);
            const chevron = this.querySelector('.chevron-icon');
            
            if (submenu.classList.contains('hidden')) {
                submenu.classList.remove('hidden');
                chevron.style.transform = 'rotate(180deg)';
            } else {
                submenu.classList.add('hidden');
                chevron.style.transform = 'rotate(0deg)';
            }
        });
    });
    
    // Mobile sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebarToggle && sidebar && overlay) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('-translate-x-full');
            overlay.classList.toggle('hidden');
        });
        
        overlay.addEventListener('click', function() {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
        });
    }
    
    // Active menu highlighting
    const currentPath = window.location.pathname;
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        const link = item.getAttribute('href');
        if (link && currentPath === link) {
            item.classList.add('active', 'bg-gray-700');
        }
    });
}

// Form validation
function setupFormValidation() {
    const forms = document.querySelectorAll('form[data-validate="true"]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredInputs = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredInputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('border-red-500');
                    
                    // Create error message if it doesn't exist
                    let errorMsg = input.parentElement.querySelector('.error-message');
                    if (!errorMsg) {
                        errorMsg = document.createElement('p');
                        errorMsg.className = 'text-red-500 text-xs mt-1 error-message';
                        errorMsg.textContent = 'Este campo é obrigatório';
                        input.parentElement.appendChild(errorMsg);
                    }
                } else {
                    input.classList.remove('border-red-500');
                    const errorMsg = input.parentElement.querySelector('.error-message');
                    if (errorMsg) {
                        errorMsg.remove();
                    }
                }
            });
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    });
}

// Modal functionality
function setupModals() {
    const modalTriggers = document.querySelectorAll('[data-toggle="modal"]');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const modalId = this.getAttribute('data-target');
            const modal = document.getElementById(modalId);
            
            if (modal) {
                modal.classList.remove('hidden');
                
                // Close modal when clicking outside
                modal.addEventListener('click', function(e) {
                    if (e.target === this) {
                        modal.classList.add('hidden');
                    }
                });
                
                // Close modal when clicking close button
                const closeButtons = modal.querySelectorAll('[data-dismiss="modal"]');
                closeButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        modal.classList.add('hidden');
                    });
                });
            }
        });
    });
}

// Initialize tooltips
function initializeTooltips() {
    const tooltipTriggers = document.querySelectorAll('[data-tooltip]');
    
    tooltipTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'absolute z-50 bg-gray-800 text-white text-xs p-2 rounded-md -mt-8 -ml-2';
            tooltip.textContent = this.getAttribute('data-tooltip');
            
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
            tooltip.style.left = (rect.left + (this.offsetWidth / 2) - (tooltip.offsetWidth / 2)) + 'px';
            
            this.addEventListener('mouseleave', function() {
                tooltip.remove();
            });
        });
    });
}

// Copy to clipboard functionality
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    // Show toast notification
    showToast('Texto copiado para a área de transferência!');
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
    } text-white`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-500');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 500);
    }, 3000);
}

// Confirm action
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Format CNPJ
function formatCNPJ(cnpj) {
    return cnpj
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
}

// Format date
function formatDate(date) {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}