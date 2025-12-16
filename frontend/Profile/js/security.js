
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

    function authHeaders() {
      return ACCESS_TOKEN ? { "Authorization": `Bearer ${ACCESS_TOKEN}` } : {};
    }

    function logout() {
  setToken(null);
  window.location.href = "../Home/home.html"; 
}


    function loadStoredToken() {
      const token = localStorage.getItem('access_token');
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
        if (!res.ok) {
          msgEl.textContent = text || "Failed to change password.";
          return;
        }

        msgEl.style.color = "green";
        msgEl.textContent = " Password changed successfully!";
        cancelChanges();
      } catch (err) {
        msgEl.textContent = "Error contacting server.";
        console.error(err);
      }
    }

   
    document.addEventListener("DOMContentLoaded", () => {
      loadStoredToken();
    });
