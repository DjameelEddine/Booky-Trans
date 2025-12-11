function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    
    if (isLoggedIn) {
        authButtons.style.display = 'none';
        userProfile.style.display = 'flex';
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
    window.location.href = '../Authentication/Signup/signup.html';
});