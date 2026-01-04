const API_BASE = "https://booky-trans.onrender.com";

let ACCESS_TOKEN = localStorage.getItem("accessToken") || null;

function setToken(token) {
  ACCESS_TOKEN = token;
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
}

function loadStoredToken() {
  const token = localStorage.getItem("accessToken");
  if (token) ACCESS_TOKEN = token;
}

function authHeaders() {
  return ACCESS_TOKEN
    ? {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      }
    : { "Content-Type": "application/json" };
}

async function loadProfile() {
  try {
    if (ACCESS_TOKEN) {
      const res = await fetch(`${API_BASE}/profile/me`, {
        headers: authHeaders()
      });

      if (res.ok) {
        const data = await res.json();

        const usernameField = document.getElementById("usernameField");
        const emailField = document.getElementById("emailField");
        const bioField = document.getElementById("bioField");
        const avatarPreview = document.getElementById("avatarPreview");

        if (usernameField) usernameField.value = data.full_name || data.username || "";
        if (emailField) emailField.value = data.email || "";
        if (bioField) bioField.value = data.bio || "";
        
       
        if (avatarPreview) {
          avatarPreview.src = data.avatar_url ? `${API_BASE}${data.avatar_url}` : "../assets/profile.svg";
        }
        return;
      }
    }
  } catch (err) {
    console.error("Load profile failed:", err);
  }

 
  document.getElementById("usernameField").value = "Guest User";
  document.getElementById("emailField").value = "guest@example.com";
  document.getElementById("bioField").value = "";
}

async function saveAccount() {
  const fullName = document.getElementById("usernameField").value.trim();
  const email = document.getElementById("emailField").value.trim();
  const bio = document.getElementById("bioField").value.trim();
  const fileInput = document.getElementById("avatarFile");

  if (!fullName || !email) {
    alert("Fill name and email");
    return;
  }

  if (ACCESS_TOKEN) {
    try {
      let avatarUrl = null;
      
      
      if (fileInput.files[0]) {
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        
        const uploadRes = await fetch(`${API_BASE}/profile/upload-avatar`, {
          method: 'POST',
          headers: { "Authorization": `Bearer ${ACCESS_TOKEN}` },
          body: formData 
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          avatarUrl = uploadData.avatar_url;
          console.log(" Picture uploaded:", avatarUrl);
        } else {
          console.error("Upload failed:", await uploadRes.text());
          alert("Picture upload failed, but profile saved");
        }
      }

      
      const body = { 
        full_name: fullName, 
        email, 
        bio 
      };
   
      if (avatarUrl) body.avatar_url = avatarUrl;

      const res = await fetch(`${API_BASE}/profile/me`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(body)
      });

      if (res.ok) {
        alert(" Profile saved successfully!");
        window.location.href = "profile.html";  
      } else {
        alert("Save failed: " + await res.text());
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error: " + err);
    }
  }
}

function openAvatarPicker() {
  document.getElementById("avatarFile").click();
}


document.addEventListener("DOMContentLoaded", () => {
  loadStoredToken();
  
  setTimeout(() => {
    loadProfile();
  }, 200);

  const fileInput = document.getElementById("avatarFile");
  if (fileInput) {
    fileInput.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (!file) return;

      
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("avatarPreview").src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
});
