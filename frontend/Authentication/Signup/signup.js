const API_BASE_URL = 'https://booky-trans.onrender.com';

if (localStorage.getItem('accessToken')) {
    window.location.replace('../../Home/home.html');
}

function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const icon = field.nextElementSibling;
    
    if (field.type === "password") {
        field.type = "text";
        icon.src = "../../assets/icons/hidepass.png";
    } else {
        field.type = "password";
        icon.src = "../../assets/icons/showpass.png";
    }
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

document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    clearErrors();
    
    const fullName = document.getElementById('fullName').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsAccepted = document.getElementById('terms').checked;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    if (!fullName.trim()) {
        showError('fullNameError', 'Please enter your full name.');
        return;
    }
    
    if (username.length < 3) {
        showError('usernameError', 'Username must be at least 3 characters long.');
        return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        showError('usernameError', 'Username can only contain letters, numbers, and underscores.');
        return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('emailError', 'Please enter a valid email address.');
        return;
    }
    
    if (password.length < 8) {
        showError('passwordError', 'Password must be at least 8 characters long.');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match.');
        return;
    }
    
    if (!termsAccepted) {
        showError('confirmPasswordError', 'Please accept the Terms of Service and Privacy Policy.');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                full_name: fullName,
                username: username,
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 400) {
                if (data.detail && data.detail.includes('Email')) {
                    showError('emailError', 'This email is already registered. Please login or use a different email.');
                } else if (data.detail && data.detail.includes('Username')) {
                    showError('usernameError', 'This username is already taken. Please choose a different username.');
                } else {
                    showToast(data.detail || 'Registration failed. Please try again.');
                }
            } else if (response.status === 422) {
                showToast('Please check your input and make sure all fields are filled correctly.');
            } else {
                showToast(data.detail || 'Registration failed. Please try again.');
            }
            return;
        }
        
        showToast('Registration successful! Please login with your credentials.', true);
        setTimeout(() => {
            window.location.href = '../Login/login.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showToast('Network error. Please check your connection and try again.');
        } else {
            showToast('An unexpected error occurred. Please try again.');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create account';
    }
});
