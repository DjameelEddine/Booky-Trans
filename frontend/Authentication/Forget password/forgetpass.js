const API_BASE_URL = 'https://booky-trans.onrender.com';

if (localStorage.getItem('accessToken')) {
    window.location.replace('../../Home/home.html');
}

let userEmail = '';
let verificationCode = '';

function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = passwordInput.parentElement.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
}

function showStep(stepId) {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    
    document.getElementById(stepId).classList.add('active');
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

function showError(message, stepId) {
    const step = document.getElementById(stepId);
    let errorDiv = step.querySelector('.error-message');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = 'color: #ff4444; font-size: 14px; margin-bottom: 15px;';
        step.insertBefore(errorDiv, step.querySelector('form'));
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(div => {
        div.style.display = 'none';
    });
}

document.getElementById('emailForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    clearErrors();
    
    userEmail = document.getElementById('email').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
        showError('Please enter a valid email address.', 'emailStep');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending code...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: userEmail })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 404) {
                showError('Email address not found. Please check and try again.', 'emailStep');
            } else {
                showError(data.detail || 'Failed to send verification code. Please try again.', 'emailStep');
            }
            return;
        }
        
        showStep('codeStep');
        
    } catch (error) {
        console.error('Error:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showError('Cannot connect to server. Please make sure the backend is running.', 'emailStep');
        } else {
            showError('An unexpected error occurred. Please try again.', 'emailStep');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send verification code';
    }
});

document.getElementById('codeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    clearErrors();
    
    const code = document.getElementById('verificationCode').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    if (code.length !== 6 || !/^\d+$/.test(code)) {
        showError('Please enter a valid 6-digit verification code.', 'codeStep');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-reset-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email: userEmail,
                code: code 
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 400) {
                showError('Invalid or expired verification code. Please try again.', 'codeStep');
            } else {
                showError(data.detail || 'Verification failed. Please try again.', 'codeStep');
            }
            return;
        }
        
        verificationCode = code;
        showStep('resetStep');
        
    } catch (error) {
        console.error('Error:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showError('Cannot connect to server. Please make sure the backend is running.', 'codeStep');
        } else {
            showError('An unexpected error occurred. Please try again.', 'codeStep');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Verify code';
    }
});

document.getElementById('resetForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    clearErrors();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    if (newPassword.length < 8) {
        showError('Password must be at least 8 characters long.', 'resetStep');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        showError('Passwords do not match.', 'resetStep');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Resetting password...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userEmail,
                code: verificationCode,
                new_password: newPassword
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 400) {
                showError('Password reset failed. The code may have expired. Please start over.', 'resetStep');
            } else {
                showError(data.detail || 'Failed to reset password. Please try again.', 'resetStep');
            }
            return;
        }
        
        showToast('Password reset successfully! You can now login with your new password.', true);
        setTimeout(() => {
            window.location.href = '../Login/login.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showError('Cannot connect to server. Please make sure the backend is running.', 'resetStep');
        } else {
            showError('An unexpected error occurred. Please try again.', 'resetStep');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Reset password';
    }
});