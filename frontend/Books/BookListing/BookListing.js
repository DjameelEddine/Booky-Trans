document.querySelector('.filter-btn').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.filter-popup').classList.toggle('show');
});

const filterBtn = document.querySelector('.filter-btn');
filterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.filter-popup').classList.toggle('show');
});

document.querySelectorAll('.book-category').forEach(category => {
    category.addEventListener('click', () => {
        category.classList.toggle('active');
    });
});

const bookCategories = document.querySelectorAll('.book-category');
bookCategories.forEach(category => {
    category.addEventListener('click', () => {
        category.classList.toggle('active');
    });
});

function toggleMenu() {
    document.getElementById("mobileMenu").classList.toggle("show");
}

// ########## BACKEND CONNECTION ############

const API_BASE = "http://127.0.0.1:8000";
let ACCESS_TOKEN = null;
let favoriteBooks = new Set();
let allBooks = [];

function loadStoredToken() {
    ACCESS_TOKEN = localStorage.getItem("accessToken");
    // ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3NjU5OTgyMDl9.dijdSIjWwWMYNNSojOYT8K58IM_j9_2RAXdNeY-9N-8";
}

function authHeaders() {
    return ACCESS_TOKEN ? {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json"
    } : {};
}

// 1. LOAD BOOKS FROM BACKEND
async function loadBooks() {
    console.log("loadBooks called");  // Check if this appears
    console.log("Fetching from:", `${API_BASE}/books`);
    try {
        const response = await fetch(`${API_BASE}/books`, {
            headers: authHeaders()
        });
        
        if (response.ok) {
            const rawBooks = await response.json();
            allBooks = rawBooks.map(book => ({
            id: book.id,
            title: book.name || book.title,
            author: book.author,
            original_language: book.language,
            target_language: book.target_language,
            img_path: book.img_path
            ? `${API_BASE}${book.img_path}`
            : '../../assets/images/book.png',
            categories: book.category ? [book.category] : []
        }));

        console.log("Book loaded img_path:", allBooks[0].img_path);  // Verify books are loaded

        renderBooks(allBooks);
        }
        else if (response.status === 404) {
            // Handle "No books found" from backend
            console.log("No books available");
            allBooks = [];
            renderBooks([]);
            // Optionally show message to user
            document.querySelector('.books-grid').innerHTML = 
                '<p class="no-books">No books available at the moment.</p>';
        } else {
            console.error("Server error:", response.status);
        }
    } catch (error) {
        console.error("Error loading books:", error);
    }
}

// Update renderBooks to use mapped fields
function renderBooks(books) {
    const booksGrid = document.querySelector('.books-grid');
    booksGrid.innerHTML = '';
    
    if (books.length === 0) {
        booksGrid.innerHTML = '<p class="no-books">No books found</p>';
        return;
    }
    
    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <button class="favorite-btn" data-book-id="${book.id}">
                <img src="../../assets/icons/heart.svg" alt="Favorite">
            </button>
            <img src="${book.img_path}" alt="Book Cover">
            <h2>${book.title}</h2>
            <p>${book.author}</p>
            <p>${book.original_language} → <span>${book.target_language}</span></p>
            <button class="translate-btn" data-book-id="${book.id}">Translate This</button>
        `;
        booksGrid.appendChild(bookCard);
        
        // Add event listeners
        const favBtn = bookCard.querySelector('.favorite-btn');
        const transBtn = bookCard.querySelector('.translate-btn');
        
        favBtn.addEventListener('click', () => toggleFavorite(favBtn));
        transBtn.addEventListener('click', () => {
            window.location.href = `../BookTranslate/BookTranslate.html?book_id=${book.id}`;
        });
    });
    
    updateFavoriteButtons();
}

// 3. FAVORITES MANAGEMENT
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
        const bookId = parseInt(btn.getAttribute("data-book-id"));
        btn.classList.toggle("active", favoriteBooks.has(bookId));
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
        const url = `${API_BASE}/books/${bookId}`;

        console.log("Toggling favorite for book ID:", bookId, "Current state:", isActive);
        
        const response = await fetch(url, {
            method: "POST",
            headers: authHeaders()
        });

        console.log("Response status:", response.status);

        if (response.ok) {
            const result = await response.json();
            if (result.favorited) {
                favoriteBooks.delete(parseInt(bookId));
                btn.classList.add("active")
            } else {
                favoriteBooks.add(parseInt(bookId));
                btn.classList.remove("active")
            }
        }
        else {
            const error = await response.json();
            alert("Error: " + (error.detail || "Failed to update favorite"));
        }
    } catch (error) {
        console.error("Error toggling favorite:", error);
        alert("Error updating favorite");
    }
}

// 4. FILTER FUNCTIONALITY
function filterBooks() {
    const searchTerm = document.querySelector('.search-field input').value.toLowerCase();
    const categories = Array.from(document.querySelectorAll('.book-category.active'))
        .map(cat => cat.textContent);
    const originalLang = document.getElementById('originalLang').value.toLowerCase();
    const targetLang = document.getElementById('targetLang').value.toLowerCase();
    
    let filtered = allBooks;
    
    // Search filter
    if (searchTerm) {
        filtered = filtered.filter(book => 
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm)
        );
    }
    
    // Category filter
    if (categories.length > 0) {
        filtered = filtered.filter(book => 
            categories.some(cat => book.categories?.includes(cat))
        );
    }

    if (originalLang) {
        filtered = filtered.filter(book =>
            book.original_language?.toLowerCase().includes(originalLang)
        );
    }

    if (targetLang) {
        filtered = filtered.filter(book =>
            book.target_language?.toLowerCase().includes(targetLang)
        );
    }

    
    renderBooks(filtered);
}

// 5. INITIALIZATION
document.addEventListener("DOMContentLoaded", async () => {
    loadStoredToken();
    
    // Existing UI handlers
    document.querySelector('.filter-btn').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.filter-popup').classList.toggle('show');
    });
    
    document.querySelectorAll('.book-category').forEach(category => {
        category.addEventListener('click', () => {
            category.classList.toggle('active');
        });
    });
    
    document.querySelector('.filter-done button').addEventListener('click', filterBooks);
    
    // Initialize data
    await loadBooks();
    if (ACCESS_TOKEN) {
        await loadFavorites();
    }
});
