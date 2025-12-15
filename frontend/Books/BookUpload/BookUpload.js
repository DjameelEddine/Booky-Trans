function toggleMenu() {
    document.getElementById("mobileMenu").classList.toggle("show");
}

const API_BASE = "http://127.0.0.1:8000";
let ACCESS_TOKEN = null;

function loadStoredToken() {
    const t = localStorage.getItem("access_token");
    if (t) {
        ACCESS_TOKEN = t;
    }
}

function authHeaders() {
    return {
        "Authorization": `Bearer ${ACCESS_TOKEN}`
    };
}

// Handle form submission
document.addEventListener("DOMContentLoaded", function() {
    loadStoredToken();
    
    const form = document.querySelector("form");
    if (form) {
        form.addEventListener("submit", async function(e) {
            e.preventDefault();

            if (!ACCESS_TOKEN) {
                alert("Please login first");
                window.location.href = "../../Authentication/Login/login.html";
                return;
            }

            // Get form values
            const bookName = document.getElementById("book-name").value.trim();
            const bookCategory = document.getElementById("book-category").value.trim();
            const bookAuthor = document.getElementById("book-description").value.trim();
            const originalLanguage = document.getElementById("book-language").value.trim();
            const targetLanguage = document.getElementById("target-language").value.trim();
            const bookFile = document.getElementById("book-upload").files[0];
            const hasPermission = document.getElementById("uplaod-permission").checked;
            const hasLicense = document.getElementById("open-licence").checked;

            // Validation
            if (!bookName || !bookCategory || !originalLanguage || !targetLanguage || !bookFile) {
                alert("Please fill in all required fields");
                return;
            }

            if (!hasPermission || !hasLicense) {
                alert("Please confirm copyright and license");
                return;
            }

            // Upload book
            try {
                const formData = new FormData();
                formData.append("name", bookName);
                formData.append("category", bookCategory);
                formData.append("author", bookAuthor || "Unknown");
                formData.append("language", originalLanguage);
                formData.append("target_language", targetLanguage);
                formData.append("file", bookFile);
                
                // Add a dummy image for now (can be updated to accept actual image)
                const dummyImage = new File(["dummy"], "cover.png", { type: "image/png" });
                formData.append("img", dummyImage);

                const response = await fetch(`${API_BASE}/Books/BookUplaod`, {
                    method: "POST",
                    headers: authHeaders(),
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    alert("Book uploaded successfully!");
                    form.reset();
                    // Optionally redirect to profile
                    setTimeout(() => {
                        window.location.href = "../../Profile/profile.html";
                    }, 1500);
                } else {
                    const error = await response.json();
                    alert("Upload failed: " + (error.detail || "Unknown error"));
                }
            } catch (error) {
                console.error("Error uploading book:", error);
                alert("Error uploading book: " + error.message);
            }
        });
    }

    // File drag and drop
    const fileInput = document.getElementById("book-upload");
    const uploadLabel = document.querySelector(".book-upload");

    if (uploadLabel) {
        uploadLabel.addEventListener("dragover", (e) => {
            e.preventDefault();
            uploadLabel.style.backgroundColor = "#e8f5ff";
        });

        uploadLabel.addEventListener("dragleave", () => {
            uploadLabel.style.backgroundColor = "";
        });

        uploadLabel.addEventListener("drop", (e) => {
            e.preventDefault();
            uploadLabel.style.backgroundColor = "";
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
            }
        });
    }
});