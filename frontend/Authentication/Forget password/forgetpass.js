function toggleMenu() {
    document.getElementById("mobileMenu").classList.toggle("show");
}

document.addEventListener('click', function(event) {
    const mobileMenu = document.getElementById('mobileMenu');
    const hamburger = document.querySelector('.hamburger-menu');
    
    if (mobileMenu.classList.contains('show') && 
        !mobileMenu.contains(event.target) && 
        !hamburger.contains(event.target)) {
        mobileMenu.classList.remove('show');
    }
});

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

let userEmail = '';

// Step 1: Request reset code
document.getElementById('emailForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    userEmail = document.getElementById('email').value;
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    submitButton.disabled = true;
    submitButton.textContent = 'Sending code...';
    
    try {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.FORGOT_PASSWORD), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: userEmail })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            showError(data.detail || 'Failed to send verification code');
            submitButton.disabled = false;
            submitButton.textContent = 'Send Code';
            return;
        }
        
        showSuccess('Verification code sent! Check your email (or console in development)');
        showStep('codeStep');
        
    } catch (error) {
        console.error('Error:', error);
        showError('Network error. Please try again.');
        submitButton.disabled = false;
        submitButton.textContent = 'Send Code';
    }
});

// Step 2: Verify code
document.getElementById('codeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const code = document.getElementById('verificationCode').value;
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    if (code.length < 6) {
        showError('Please enter a valid 6-digit code');
        return;
    }
    
    submitButton.disabled = true;
    submitButton.textContent = 'Verifying...';
    
    try {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.VERIFY_CODE), {
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
            showError(data.detail || 'Invalid verification code');
            submitButton.disabled = false;
            submitButton.textContent = 'Verify Code';
            return;
        }
        
        showSuccess('Code verified successfully!');
        showStep('resetStep');
        
    } catch (error) {
        console.error('Error:', error);
        showError('Network error. Please try again.');
        submitButton.disabled = false;
        submitButton.textContent = 'Verify Code';
    }
});

// Step 3: Reset password
document.getElementById('resetForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const code = document.getElementById('verificationCode').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    if (newPassword.length < 8) {
        showError('Password must be at least 8 characters long!');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        showError('Passwords do not match!');
        return;
    }
    
    submitButton.disabled = true;
    submitButton.textContent = 'Resetting password...';
    
    try {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.RESET_PASSWORD), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userEmail,
                code: code,
                new_password: newPassword
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            showError(data.detail || 'Failed to reset password');
            submitButton.disabled = false;
            submitButton.textContent = 'Reset Password';
            return;
        }
        
        showSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
            window.location.href = '../Login/login.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error:', error);
        showError('Network error. Please try again.');
        submitButton.disabled = false;
        submitButton.textContent = 'Reset Password';
    }
});