<<<<<<< HEAD
function switchBooksTab(name) {
  document.querySelectorAll(".tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === name);
  });

  document.querySelectorAll(".book-card").forEach(card => {
    const type = card.getAttribute("data-type");
    card.style.display = name === "uploaded" || type === name ? "flex" : "none";
  });
}

function handlePreview(title) {
  alert("Preview " + title);
}
// Frontend profile page loads:
fetch('/profile/me', { headers: { Authorization: `Bearer ${token}` } })
  .then(res => res.json())
  .then(user => {
    // Fill settings form: name, email
  })

// Frontend "Save Settings":
f// Loads settings form:
fetch('http://127.0.0.1:8000/profile/me')
  .then(res => res.json())
  .then(user => {
    nameField.value = user.first_name  // "Isabella"
    emailField.value = user.email      // "isabella@example.com"
  })

// Save button:
fetch('http://127.0.0.1:8000/profile/me', {
  method: 'PUT',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    first_name: 'New Name',
    email: 'new@example.com'
  })
})
// Replace backend URL with YOUR server:
const API_BASE = 'http://127.0.0.1:8000';

// Load profile:
async function loadProfile() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/profile/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const user = await response.json();
  
  // Fill form:
  document.getElementById('firstName').value = user.first_name;
  document.getElementById('email').value = user.email;
}

// Save profile:
async function saveProfile() {
  const token = localStorage.getItem('token');
  const formData = {
    first_name: document.getElementById('firstName').value,
    email: document.getElementById('email').value
  };
  
  await fetch(`${API_BASE}/profile/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(formData)
  });
}
  function logout() {
    setToken(null);
    window.location.href = "login.html"; // change to your real login/landing page
  }

  // call this when page loads
  loadStoredToken();
=======
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
>>>>>>> develop
