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

document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsAccepted = document.getElementById('terms').checked;
    const submitButton = e.target.querySelector('.create-account-btn');
    
    // Client-side validation
    if (password.length < 8) {
        showError('Password must be at least 8 characters long!');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match!');
        return;
    }
    
    if (!termsAccepted) {
        showWarning('Please accept the Terms of Service and Privacy Policy');
        return;
    }
    
    // Disable button and show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Creating account...';
    
    try {
        // Call backend API
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REGISTER), {
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
            // Handle errors from backend
            if (response.status === 400) {
                showError(data.detail || 'Registration failed. Please check your information.');
            } else {
                showError('An error occurred during registration. Please try again.');
            }
            submitButton.disabled = false;
            submitButton.textContent = 'Create account';
            return;
        }
        
        // Registration successful
        showSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => {
            window.location.href = '../Login/login.html';
        }, 1500);
        
    } catch (error) {
        console.error('Registration error:', error);
        showError('Network error. Please check your connection and try again.');
        submitButton.disabled = false;
        submitButton.textContent = 'Create account';
    }
});
