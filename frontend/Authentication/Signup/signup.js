function toggleMenu() {
    document.getElementById("mobileMenu").classList.toggle("show");
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

// Form submission handler
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsAccepted = document.getElementById('terms').checked;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Validate terms accepted
    if (!termsAccepted) {
        alert('Please accept the Terms of Service and Privacy Policy');
        return;
    }
    
    // Here you would typically send the data to your backend
    console.log('Signup data:', { username, email, password });
    alert('Account created successfully!');
    
    // Reset form
    this.reset();
});
