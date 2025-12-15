const API_BASE = "http://127.0.0.1:8000";
let ACCESS_TOKEN = null;
let favoriteBooks = new Set();

function loadStoredToken() {
    const t = localStorage.getItem("access_token");
    if (t) {
        ACCESS_TOKEN = t;
    }
}

function authHeaders() {
    return {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json"
    };
}

// Load favorite books from API
async function loadFavorites() {
    if (!ACCESS_TOKEN) return;
    
    try {
        const response = await fetch(`${API_BASE}/profile/favorites`, {
            headers: authHeaders()
        });
        if (response.ok) {
            const favorites = await response.json();
            favoriteBooks = new Set(favorites.map(b => b.id));
            updateFavoriteButtons();
        }
    } catch (error) {
        console.error("Error loading favorites:", error);
    }
}

function updateFavoriteButtons() {
    document.querySelectorAll(".favorite-btn").forEach(btn => {
        const bookId = btn.getAttribute("data-book-id");
        if (favoriteBooks.has(parseInt(bookId))) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

async function toggleFavorite(btn) {
    if (!ACCESS_TOKEN) {
        alert("Please login to add favorites");
        window.location.href = "../../Authentication/Login/login.html";
        return;
    }

    const bookId = btn.getAttribute("data-book-id");
    const isActive = btn.classList.contains("active");

    try {
        let response;
        if (isActive) {
            // Remove favorite
            response = await fetch(`${API_BASE}/profile/favorites/${bookId}`, {
                method: "DELETE",
                headers: authHeaders()
            });
        } else {
            // Add favorite
            response = await fetch(`${API_BASE}/profile/favorites/${bookId}`, {
                method: "POST",
                headers: authHeaders()
            });
        }

        if (response.ok) {
            if (isActive) {
                favoriteBooks.delete(parseInt(bookId));
                btn.classList.remove("active");
            } else {
                favoriteBooks.add(parseInt(bookId));
                btn.classList.add("active");
            }
        } else {
            const error = await response.json();
            alert("Error: " + (error.detail || "Failed to update favorite"));
        }
    } catch (error) {
        console.error("Error toggling favorite:", error);
        alert("Error updating favorite");
    }
}

document.querySelector('.filter-btn').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.filter-popup').classList.toggle('show');
});

document.querySelectorAll('.book-category').forEach(category => {
    category.addEventListener('click', () => {
        category.classList.toggle('active');
    });
});

function toggleMenu() {
    document.getElementById("mobileMenu").classList.toggle("show");
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    loadStoredToken();
    loadFavorites();
});