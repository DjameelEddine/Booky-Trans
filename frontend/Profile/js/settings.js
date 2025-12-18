const API_BASE = "http://127.0.0.1:8000";
let ACCESS_TOKEN = localStorage.getItem('access_token') || null;

function setToken(token) {
  ACCESS_TOKEN = token;
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }
}

function loadStoredToken() {
  const token = localStorage.getItem('access_token');
  if (token) ACCESS_TOKEN = token;
}

function authHeaders() {
  return ACCESS_TOKEN ? { 
    "Authorization": `Bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json"
  } : { "Content-Type": "application/json" };
}

function logout() {
  setToken(null);
  window.location.href = "../Home/home.html"; 
}

async function loadProfile() {
  try {
    const res = await fetch(`${API_BASE}/profile/me`, {
      headers: authHeaders()
    });
    
    if (!res.ok) {
      console.log("No profile data");
      return;
    }
    
    const data = await res.json();
    document.getElementById("usernameField").value = data.full_name || data.username || "";
    document.getElementById("emailField").value = data.email || "";
    document.getElementById("bioField").value = data.bio || "";
    if (data.avatar_url) {
      document.getElementById("avatarPreview").src = data.avatar_url;
    }
  } catch (err) {
    console.error("Failed to load profile:", err);
  }
}

async function saveAccount() {
  try {
    const body = {
      full_name: document.getElementById("usernameField").value.trim(),  
      email: document.getElementById("emailField").value.trim(),
      bio: document.getElementById("bioField").value.trim()
    };

    if (!body.full_name || !body.email) {
      alert("Please fill full name and email");
      return;
    }

    const res = await fetch(`${API_BASE}/profile/me`, {
      method: "PATCH",  
      headers: authHeaders(),
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errorText = await res.text();
      alert("Save failed: " + errorText);
      return;
    }

    alert(" Account saved successfully!");
  } catch (err) {
    alert("Error saving account");
    console.error(err);
  }
}

function openAvatarPicker() {
  document.getElementById("avatarFile").click();
}

document.addEventListener("DOMContentLoaded", () => {
  loadStoredToken();
  loadProfile();
  
  const fileInput = document.getElementById("avatarFile");
  fileInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("avatarPreview").src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
});
