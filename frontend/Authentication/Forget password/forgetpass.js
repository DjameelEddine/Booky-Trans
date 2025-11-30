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

document.getElementById('emailForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    userEmail = document.getElementById('email').value;
    
    console.log('Sending verification code to:', userEmail);
    
    alert('Verification code sent to ' + userEmail);
    
    showStep('codeStep');
});

document.getElementById('codeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const code = document.getElementById('verificationCode').value;
    
    console.log('Verifying code:', code);
    
    if (code.length >= 4) {
        alert('Code verified successfully!');
        showStep('resetStep');
    } else {
        alert('Invalid verification code!');
    }
});

document.getElementById('resetForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    if (newPassword.length < 8) {
        alert('Password must be at least 8 characters long!');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    console.log('Resetting password for:', userEmail);
    console.log('New password:', newPassword);
    
    alert('Password reset successfully!');
    
    window.location.href = '../Login/login.html';
});