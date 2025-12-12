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

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const submitButton = e.target.querySelector('.login-submit-btn');
    
    // Client-side validation
    if (password.length < 8) {
        showError('Password must be at least 8 characters long!');
        return;
    }
    
    // Disable button and show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Logging in...';
    
    try {
        // Create form data for OAuth2PasswordRequestForm
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        
        // Call backend API
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.LOGIN), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            // Handle errors from backend
            if (response.status === 403) {
                showError('Invalid username or password. Please try again.');
            } else {
                showError('An error occurred during login. Please try again.');
            }
            submitButton.disabled = false;
            submitButton.textContent = 'Login';
            return;
        }
        
        // Login successful - save token
        saveToken(data.access_token, data.token_type);
        
        // Fetch and store user information
        try {
            await getUserInfo();
        } catch (err) {
            console.error('Error fetching user info:', err);
        }
        
        showSuccess('Login successful! Redirecting...');
        
        // Redirect to profile page
        setTimeout(() => {
            window.location.href = '../../Profile/profile.html';
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        showError('Network error. Please check your connection and try again.');
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
    }
});
