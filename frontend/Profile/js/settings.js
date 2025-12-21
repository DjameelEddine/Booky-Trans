const API_BASE = "http://127.0.0.1:8000";

let ACCESS_TOKEN = localStorage.getItem('accessToken') || null;

function setToken(token) {
  ACCESS_TOKEN = token;
  if (token) {
   
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
}

function loadStoredToken() {

  const token = localStorage.getItem('accessToken');
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
    if (ACCESS_TOKEN) {
      const res = await fetch(`${API_BASE}/profile/me`, {
        headers: authHeaders()
      });
      
      if (res.ok) {
        const data = await res.json();
        document.getElementById("usernameField").value = data.full_name || data.username || "";
        document.getElementById("emailField").value = data.email || "";
        document.getElementById("bioField").value = data.bio || "";
        if (data.avatar_url) {
          document.getElementById("avatarPreview").src = data.avatar_url;
        }
        return;  
      }
    }
  } catch (err) {
    console.error("Backend failed:", err);
  }

  if (localStorage.getItem('isLoggedIn') === 'true') {
    const email = localStorage.getItem('userEmail') || 'team@example.com';
    document.getElementById("usernameField").value = email;
    document.getElementById("emailField").value = email;
    document.getElementById("bioField").value = "Demo team member";
    return;
  }

  document.getElementById("usernameField").value = "Guest User";
  document.getElementById("emailField").value = "guest@example.com";
  document.getElementById("bioField").value = "Demo account";
}

async function saveAccount() {
  const body = {
    full_name: document.getElementById("usernameField").value.trim(),  
    email: document.getElementById("emailField").value.trim(),
    bio: document.getElementById("bioField").value.trim()
  };

  if (!body.full_name || !body.email) {
    alert("Please fill full name and email");
    return;
  }

  if (ACCESS_TOKEN) {
    try {
      const res = await fetch(`${API_BASE}/profile/me`, {
        method: "PATCH",  
        headers: authHeaders(),
        body: JSON.stringify(body)
      });

      if (res.ok) {
        alert("Account saved successfully!");
        return; 
      } else {
        const errorText = await res.text();
        alert("Save failed: " + errorText);
        return;
      }
    } catch (err) {
      console.error("Backend save failed:", err);
    }
  }

  if (localStorage.getItem('isLoggedIn') === 'true') {
    localStorage.setItem('userEmail', body.email);
    alert(" account saved locally!");
    return;
  }

  alert(" settings saved!");
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
