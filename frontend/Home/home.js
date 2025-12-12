async function checkLoginStatus() {
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    
    if (isAuthenticated()) {
        authButtons.style.display = 'none';
        userProfile.style.display = 'flex';
        
        // Fetch and display user info
        try {
            const userData = await getUserInfo();
            // You can update profile picture or other user info here if needed
            // For now, the profile icon click will navigate to profile page
        } catch (error) {
            console.error('Error loading user info:', error);
            // If token is invalid, logout
            removeToken();
            authButtons.style.display = 'flex';
            userProfile.style.display = 'none';
        }
    } else {
        authButtons.style.display = 'flex';
        userProfile.style.display = 'none';
    }
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

document.querySelector('.get-started-btn').addEventListener('click', function() {
    if (isAuthenticated()) {
        // User is logged in, redirect to community
        window.location.href = '../Books/BookListing/BooksListing.html';
    } else {
        // User is not logged in, redirect to signup
        window.location.href = '../Authentication/Signup/signup.html';
    }
});