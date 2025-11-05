const API_BASE = '/api';

// Common utility functions
function showMessage(message, type = 'error') {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        }
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// Registration functionality
if (document.getElementById('registerForm')) {
    const registerForm = document.getElementById('registerForm');
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();
        
        const formData = new FormData(registerForm);
        const data = {
            full_name: formData.get('fullName'),
            email: formData.get('email'),
            username: formData.get('username'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword')
        };
        
        // Client-side validation
        let isValid = true;
        
        if (!data.full_name.trim()) {
            document.getElementById('fullNameError').textContent = 'Full name is required';
            isValid = false;
        }
        
        if (!validateEmail(data.email)) {
            document.getElementById('emailError').textContent = 'Valid email is required';
            isValid = false;
        }
        
        if (data.username.length < 3) {
            document.getElementById('usernameError').textContent = 'Username must be at least 3 characters';
            isValid = false;
        }
        
        if (!validatePassword(data.password)) {
            document.getElementById('passwordError').textContent = 'Password must be at least 6 characters';
            isValid = false;
        }
        
        if (data.password !== data.confirmPassword) {
            document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
            isValid = false;
        }
        
        if (!isValid) return;
        
        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            // Check if response is OK before parsing JSON
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                showMessage('Registration successful! Redirecting...', 'success');
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                setTimeout(() => {
                    window.location.href = '/student';
                }, 2000);
            } else {
                showMessage(result.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showMessage('Network error. Please try again. ' + error.message);
        }
    });
}

// Login functionality
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();
        
        const formData = new FormData(loginForm);
        const data = {
            username: formData.get('username'),
            password: formData.get('password')
        };
        
        // Client-side validation
        let isValid = true;
        
        if (!data.username.trim()) {
            document.getElementById('usernameError').textContent = 'Username or email is required';
            isValid = false;
        }
        
        if (!data.password) {
            document.getElementById('passwordError').textContent = 'Password is required';
            isValid = false;
        }
        
        if (!isValid) return;
        
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            // Check if response is OK before parsing JSON
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                showMessage('Login successful! Redirecting...', 'success');
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                setTimeout(() => {
                    window.location.href = '/student';
                }, 1500);
            } else {
                showMessage(result.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('Network error. Please try again. ' + error.message);
        }
    });
}

// Check if user is already logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    const currentPath = window.location.pathname;
    
    if (token && (currentPath === '/login' || currentPath === '/register')) {
        window.location.href = '/student';
    } else if (!token && currentPath === '/student') {
        window.location.href = '/login';
    }
}

// Initialize auth check
document.addEventListener('DOMContentLoaded', checkAuth);