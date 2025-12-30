/**
 * SkillSwap - Authentication JavaScript
 * FIXED: Saves data to localStorage so Dashboard doesn't redirect loop.
 */

const Auth = {
  init() {
    this.initLoginForm();
    this.initRegisterForm();
  },

  initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');

    // Validation Listeners
    if (emailInput) {
      emailInput.addEventListener('blur', () => this.validateEmail(emailInput, emailError));
      emailInput.addEventListener('input', () => {
        if (this.isValidEmail(emailInput.value.trim())) this.showSuccess(emailInput, emailError);
      });
    }
    if (passwordInput) {
      passwordInput.addEventListener('blur', () => this.validatePassword(passwordInput, passwordError));
      passwordInput.addEventListener('input', () => {
        if (this.isValidPassword(passwordInput.value)) this.showSuccess(passwordInput, passwordError);
      });
    }

    // Submit Listener
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin(loginForm);
    });
  },

  initRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    
    if (fullNameInput) {
      fullNameInput.addEventListener('blur', () => {
        this.validateName(fullNameInput, document.getElementById('nameError'));
      });
    }

    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRegister(registerForm);
    });
  },

  // --- LOGIN LOGIC (THE FIX IS HERE) ---
  handleLogin(form) {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const successAlert = document.getElementById('successAlert');

    let isValid = true;
    if (!this.validateEmail(emailInput, document.getElementById('emailError'))) isValid = false;
    if (!this.validatePassword(passwordInput, document.getElementById('passwordError'))) isValid = false;

    if (isValid) {
      loginBtn.disabled = true;
      loginBtn.textContent = 'Logging in...';

      fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.value.trim(),
          password: passwordInput.value
        })
      })
      .then(async (response) => {
        const data = await response.json();
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';

        if (response.ok) {
          // 1. Prepare User Data
          const dashboardUser = {
            name: data.user.full_name,
            email: emailInput.value,
            skillCoins: 150,
            avatar: (data.user.full_name || 'U').charAt(0).toUpperCase()
          };

          // 2. CRITICAL FIX: Save to LocalStorage
          console.log("Saving user data:", dashboardUser); // Debug log
          localStorage.setItem('skillswap_user', JSON.stringify(dashboardUser));
          localStorage.setItem('skillswap_authenticated', 'true');

          // 3. Show Success & Redirect
          if (successAlert) {
            successAlert.textContent = "Success! Redirecting...";
            successAlert.classList.add('show');
          }

          // Small delay to ensure storage is saved before page switch
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 800);

        } else {
          alert(data.message || 'Invalid credentials');
        }
      })
      .catch((error) => {
        console.error('Login Error:', error);
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
        alert('Server connection failed. Is the server running?');
      });
    }
  },

  handleRegister(form) {
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const registerBtn = document.getElementById('registerBtn');
    const successAlert = document.getElementById('successAlert');

    let isValid = true;
    if (!this.validateName(fullNameInput, document.getElementById('nameError'))) isValid = false;
    if (!this.validateEmail(emailInput, document.getElementById('emailError'))) isValid = false;
    if (!this.validatePassword(passwordInput, document.getElementById('passwordError'))) isValid = false;

    if (isValid) {
      registerBtn.disabled = true;
      registerBtn.textContent = 'Creating Account...';

      const userData = {
        full_name: fullNameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value
      };

      fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      .then(async (response) => {
        const data = await response.json();
        registerBtn.disabled = false;
        registerBtn.textContent = 'Register';

        if (data.status === 'success') {
          if (successAlert) {
             successAlert.textContent = "Account created! Redirecting to Login...";
             successAlert.classList.add('show');
          }
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1500);
        } else {
          alert(data.message || 'Registration failed.');
        }
      })
      .catch(() => {
        registerBtn.disabled = false;
        registerBtn.textContent = 'Register';
        alert('Server connection failed');
      });
    }
  },

  // Helpers
  validateName(input, errorElement) {
    if (input.value.trim().length < 2) {
      this.showError(input, errorElement, 'Name required');
      return false;
    }
    this.showSuccess(input, errorElement);
    return true;
  },
  validateEmail(input, errorElement) {
    if (!this.isValidEmail(input.value.trim())) {
      this.showError(input, errorElement, 'Invalid email');
      return false;
    }
    this.showSuccess(input, errorElement);
    return true;
  },
  validatePassword(input, errorElement) {
    if (input.value.length < 6) {
      this.showError(input, errorElement, 'Password (6+ chars)');
      return false;
    }
    this.showSuccess(input, errorElement);
    return true;
  },
  showError(input, errorElement, message) {
    input.classList.add('error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
    }
  },
  showSuccess(input, errorElement) {
    input.classList.remove('error');
    input.classList.add('success');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.remove('show');
    }
  },
  isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); },
  isValidPassword(password) { return password.length >= 6; }
};

document.addEventListener('DOMContentLoaded', () => { Auth.init(); });
window.Auth = Auth;