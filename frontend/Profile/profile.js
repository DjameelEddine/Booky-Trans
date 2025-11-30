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

document.querySelectorAll('.side-item:not(.logout)').forEach(item => {
    item.addEventListener('click', function() {
        const screen = this.getAttribute('data-screen');
        
        document.querySelectorAll('.side-item:not(.logout)').forEach(el => {
            el.classList.remove('active');
        });
        this.classList.add('active');
        
        document.querySelectorAll('.screen-content').forEach(el => {
            el.classList.remove('active');
        });
        
        const screenElement = document.getElementById(screen + 'Screen');
        if (screenElement) {
            screenElement.classList.add('active');
        }
    });
});

document.querySelector('.logout').addEventListener('click', function() {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('username');
        window.location.href = '../Home/home.html';
    }
});

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');
        
        document.querySelectorAll('.tab').forEach(el => {
            el.classList.remove('active');
        });
        this.classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(el => {
            el.classList.remove('active');
        });
        
        const tabContent = document.getElementById(tabName + 'Tab');
        if (tabContent) {
            tabContent.classList.add('active');
        }
    });
});

document.querySelectorAll('.settings-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const tabName = this.getAttribute('data-settings-tab');
        
        document.querySelectorAll('.settings-tab').forEach(el => {
            el.classList.remove('active');
        });
        this.classList.add('active');
        
        document.querySelectorAll('.settings-content').forEach(el => {
            el.classList.remove('active');
        });
        
        const tabContent = document.getElementById(tabName + 'Tab');
        if (tabContent) {
            tabContent.classList.add('active');
        }
    });
});

function saveAccount() {
    alert('Account changes saved! (Demo)');
}

function saveSecurity() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword && newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    alert('Password updated! (Demo)');
}
