/**
 * login.js - Handles Login Logic with Regex Validation
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const loginBtn = document.getElementById('loginBtn');
    const successAlert = document.getElementById('successAlert');

    // --- REGEX VALIDATORS ---
    const patterns = {
        // Email: Standard pattern (text @ text . text)
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        
        // Password: At least 6 chars (You can make this stricter)
        password: /^.{6,}$/
    };

    function validateField(field, regex, errorEl, msg) {
        if (!regex.test(field.value.trim())) {
            field.classList.add('error');
            field.classList.remove('success');
            errorEl.textContent = msg;
            errorEl.classList.add('show');
            return false;
        } else {
            field.classList.remove('error');
            field.classList.add('success');
            errorEl.textContent = '';
            errorEl.classList.remove('show');
            return true;
        }
    }

    // Real-time Validation
    emailInput.addEventListener('input', () => {
        validateField(emailInput, patterns.email, emailError, "Invalid email format");
    });

    passwordInput.addEventListener('input', () => {
        validateField(passwordInput, patterns.password, passwordError, "Password must be at least 6 chars");
    });

    // Form Submit
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const isEmailValid = validateField(emailInput, patterns.email, emailError, "Invalid email address");
            const isPassValid = validateField(passwordInput, patterns.password, passwordError, "Password too short");

            if (isEmailValid && isPassValid) {
                loginBtn.disabled = true;
                loginBtn.textContent = 'Verifying...';
                handleLogin(emailInput.value.trim(), passwordInput.value);
            }
        });
    }

    function handleLogin(email, password) {
        fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        .then(async (response) => {
            const data = await response.json();
            if (data.status === 'success') {
                // Save User
                const userToSave = {
                    name: data.user.full_name,
                    email: email,
                    skillCoins: 150,
                    avatar: (data.user.full_name || 'U').charAt(0).toUpperCase()
                };
                localStorage.setItem('skillswap_user', JSON.stringify(userToSave));
                
                successAlert.classList.add('show');
                setTimeout(() => window.location.href = 'dashboard.html', 1000);
            } else {
                alert(data.message || 'Login failed.');
                loginBtn.disabled = false;
                loginBtn.textContent = 'Login';
            }
        })
        .catch((error) => {
            console.error(error);
            alert('Network error.');
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        });
    }
});