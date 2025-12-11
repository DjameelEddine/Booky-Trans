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

document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsAccepted = document.getElementById('terms').checked;
    
    if (password.length < 8) {
        alert('Password must be at least 8 characters long!');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    if (!termsAccepted) {
        alert('Please accept the Terms of Service and Privacy Policy');
        return;
    }
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('username', username);
    
    window.location.href = '../../Profile/profile.html';
});
