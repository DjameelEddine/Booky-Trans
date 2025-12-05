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

