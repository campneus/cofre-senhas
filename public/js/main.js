// public/js/main.js
document.addEventListener('DOMContentLoaded', function() {
  // Toggle sidebar submenu
  const menuDropdowns = document.querySelectorAll('.menu-dropdown');
  menuDropdowns.forEach(dropdown => {
    dropdown.addEventListener('click', function() {
      const submenu = this.nextElementSibling;
      submenu.classList.toggle('open');
      const icon = this.querySelector('.dropdown-icon');
      
      if (submenu.classList.contains('open')) {
        icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
      } else {
        icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
      }
    });
  });
  
  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      const sidebar = document.querySelector('.sidebar');
      sidebar.classList.toggle('open');
    });
  }
  
  // Flash message auto dismiss
  const flashMessages = document.querySelectorAll('.alert');
  flashMessages.forEach(message => {
    setTimeout(() => {
      message.style.opacity = '0';
      setTimeout(() => {
        message.style.display = 'none';
      }, 500);
    }, 5000);
  });
  
  // Password visibility toggle
  const passwordToggles = document.querySelectorAll('.password-toggle');
  passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
      const passwordField = this.previousElementSibling;
      const type = passwordField.getAttribute('type');
      
      if (type === 'password') {
        passwordField.setAttribute('type', 'text');
        this.innerHTML = '<i class="fas fa-eye-slash"></i>';
      } else {
        passwordField.setAttribute('type', 'password');
        this.innerHTML = '<i class="fas fa-eye"></i>';
      }
    });
  });
  
  // View password button on credentials list
  const viewPasswordBtns = document.querySelectorAll('.view-password');
  viewPasswordBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const passwordCell = this.closest('td');
      const passwordText = passwordCell.getAttribute('data-password');
      const currentText = passwordCell.querySelector('.password-text').textContent;
      
      if (currentText === '••••••••') {
        passwordCell.querySelector('.password-text').textContent = passwordText;
        this.innerHTML = '<i class="fas fa-eye-slash"></i>';
      } else {
        passwordCell.querySelector('.password-text').textContent = '••••••••';
        this.innerHTML = '<i class="fas fa-eye"></i>';
      }
    });
  });
  
  // Copy password to clipboard
  const copyButtons = document.querySelectorAll('.copy-password');
  if (copyButtons) {
    copyButtons.forEach(button => {
      button.addEventListener('click', function() {
        const password = this.getAttribute('data-password');
        
        // Create temporary textarea to copy from
        const textarea = document.createElement('textarea');
        textarea.value = password;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        
        // Copy text
        textarea.select();
        document.execCommand('copy');
        
        // Remove temporary element
        document.body.removeChild(textarea);
        
        // Show feedback
        this.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
          this.innerHTML = '<i class="fas fa-copy"></i>';
        }, 1500);
      });
    });
  }
  
  // Confirm delete
  const deleteButtons = document.querySelectorAll('.delete-form');
  deleteButtons.forEach(form => {
    form.addEventListener('submit', function(e) {
      const confirm = window.confirm('Tem certeza que deseja excluir este item?');
      if (!confirm) {
        e.preventDefault();
      }
    });
  });
  
  // Search form submission
  const searchInput = document.getElementById('search-input');
  const searchForm = document.getElementById('search-form');
  
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', function(e) {
      if (searchInput.value.trim() === '') {
        e.preventDefault();
      }
    });
  }
  
  // Category filter
  const categorySelect = document.getElementById('category-filter');
  if (categorySelect) {
    categorySelect.addEventListener('change', function() {
      document.getElementById('filter-form').submit();
    });
  }
  
  // Generate random password
  const generatePasswordBtn = document.getElementById('generate-password');
  const passwordField = document.getElementById('password');
  
  if (generatePasswordBtn && passwordField) {
    generatePasswordBtn.addEventListener('click', function() {
      const length = 16;
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}|:<>?';
      let password = '';
      
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
      }
      
      passwordField.value = password;
    });
  }
});