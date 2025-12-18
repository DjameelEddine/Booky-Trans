const API_BASE_URL = 'http://127.0.0.1:8000';

if (localStorage.getItem('accessToken')) {
    window.location.replace('../../Home/home.html');
}

function showToast(message, isSuccess = false) {
    const toast = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    
    toastMessage.textContent = message;
    
    if (isSuccess) {
        toastIcon.textContent = '✓';
        toastIcon.style.color = '#4CAF50';
    } else {
        toastIcon.textContent = '✕';
        toastIcon.style.color = '#ff4444';
    }
    
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 4000);
}

function closeToast() {
    document.getElementById('toastNotification').style.display = 'none';
}

function showError(elementId, message) {
    clearErrors();
    const errorDiv = document.getElementById(elementId);
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(div => {
        div.style.display = 'none';
    });
}

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    clearErrors();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    if (!username.trim()) {
        showError('usernameError', 'Username is required.');
        return;
    }
    
    if (password.length < 8) {
        showError('passwordError', 'Password must be at least 8 characters long.');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    
    try {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Login';
            }, 300);
            
            if (response.status === 403) {
                showError('passwordError', 'Invalid username or password.');
            } else if (response.status === 422) {
                showError('usernameError', 'Please provide valid username and password.');
            } else {
                showError('passwordError', data.detail || 'Login failed. Please try again.');
            }
            return;
        }
        
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('username', username);
        
        showToast('Login successful! Redirecting...', true);
        setTimeout(() => {
            window.location.href = '../../Home/home.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showToast('Network error. Please check your connection and try again.');
        } else {
            showToast('An unexpected error occurred. Please try again.');
        }
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
    }
});
