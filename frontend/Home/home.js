const API_BASE_URL = 'http://127.0.0.1:8000';

async function checkLoginStatus() {
    const token = localStorage.getItem('accessToken');
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    
    if (token) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                authButtons.style.display = 'none';
                userProfile.style.display = 'flex';
                return true;
            } else {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('username');
            }
        } catch (error) {
            console.error('Error verifying token:', error);
        }
    }
    
    authButtons.style.display = 'flex';
    userProfile.style.display = 'none';
    return false;
}

window.addEventListener('load', checkLoginStatus);

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

document.querySelector('.get-started-btn').addEventListener('click', async function() {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
        window.location.href = '../Books/BookListing/BooksListing.html';
    } else {
        window.location.href = '../Authentication/Signup/signup.html';
    }
});