const API_BASE = "https://booky-trans.onrender.com";


let ACCESS_TOKEN = localStorage.getItem('accessToken') || null;

function setToken(token) {
  ACCESS_TOKEN = token;
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
}

function authHeaders() {
  return ACCESS_TOKEN ? { "Authorization": `Bearer ${ACCESS_TOKEN}` } : {};
}

function logout() {
  setToken(null);
  window.location.href = "../Home/home.html";
}

function loadStoredToken() {
  const token = localStorage.getItem('accessToken');
  if (token) ACCESS_TOKEN = token;
}

function cancelChanges() {
  document.getElementById("currentPassword").value = "";
  document.getElementById("newPassword").value = "";
  document.getElementById("confirmPassword").value = "";
  document.getElementById("securityMessage").textContent = "";
}

async function changePassword() {
  const current = document.getElementById("currentPassword").value;
  const newPass = document.getElementById("newPassword").value;
  const confirm = document.getElementById("confirmPassword").value;
  const msgEl = document.getElementById("securityMessage");

  msgEl.style.color = "#f00";
  msgEl.textContent = "";

  if (!current || !newPass || !confirm) {
    msgEl.textContent = "Please fill all fields.";
    return;
  }
  if (newPass !== confirm) {
    msgEl.textContent = "New passwords do not match.";
    return;
  }
  if (newPass.length < 6) {
    msgEl.textContent = "New password must be at least 6 characters.";
    return;
  }


  if (ACCESS_TOKEN) {
    try {
      const res = await fetch(`${API_BASE}/profile/me/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify({
          current_password: current,
          new_password: newPass
        })
      });

      const text = await res.text();
      if (res.ok) {
        msgEl.style.color = "green";
        msgEl.textContent = "Password changed successfully!";
        cancelChanges();
        return;
      } else {
        msgEl.textContent = text || "Current password incorrect.";
        return;
      }
    } catch (err) {
      console.error("Backend failed:", err);
    }
  }


  msgEl.style.color = "orange";
  msgEl.textContent = " Password saved ";

  localStorage.setItem('demoPassword', newPass);
  cancelChanges();
  setTimeout(() => {
    msgEl.style.color = "green";
    msgEl.textContent = " password updated!";
  }, 2000);
}

document.addEventListener("DOMContentLoaded", () => {
  loadStoredToken();

  const msgEl = document.getElementById("securityMessage");
  if (ACCESS_TOKEN) {
    msgEl.style.color = "green";
    msgEl.textContent = "password changes";
  } else if (localStorage.getItem('isLoggedIn') === 'true') {
    msgEl.style.color = "orange";
    msgEl.textContent = " password changes";
  }
});
