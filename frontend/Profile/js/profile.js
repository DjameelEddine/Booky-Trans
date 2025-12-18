const API_BASE = "http://127.0.0.1:8000";

let ACCESS_TOKEN = null;
let booksData = {
  uploaded: [],
  translated: [],
  favorite: []
};

function setToken(token) {
  ACCESS_TOKEN = token;
  if (token) {
    localStorage.setItem("access_token", token);
  } else {
    localStorage.removeItem("access_token");
  }
}

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

async function loadUserProfile() {
  if (!ACCESS_TOKEN) return;
  
  try {
    const response = await fetch(`${API_BASE}/profile/me`, {
      headers: authHeaders()
    });
    
    if (response.ok) {
      const user = await response.json();
      document.getElementById('user-name').textContent = user.full_name || user.username;
      document.getElementById('user-avatar').src = user.avatar_url || '../assets/profile.svg';
      document.getElementById('user-avatar').alt = user.full_name || user.username;
      document.getElementById('user-description1').textContent = user.bio || 'No bio available';
      document.getElementById('user-description2').textContent = user.description || '';
    } else {
      console.error('Failed to load user profile');
    }
  } catch (error) {
    console.error('Failed to load user profile:', error);
  }
}

function logout() {
  setToken(null);
  window.location.href = "../Home/home.html"; 
}

async function loadAllBooks() {
  try {
    if (!ACCESS_TOKEN) {
      console.log("No token found");
      return;
    }

    const uploadedRes = await fetch(`${API_BASE}/profile/uploaded-books`, {
      headers: authHeaders()
    });
    if (uploadedRes.ok) {
      booksData.uploaded = await uploadedRes.json();
    }

    const translatedRes = await fetch(`${API_BASE}/profile/translated-books`, {
      headers: authHeaders()
    });
    if (translatedRes.ok) {
      booksData.translated = await translatedRes.json();
    }

    const favoriteRes = await fetch(`${API_BASE}/profile/favorites`, {
      headers: authHeaders()
    });
    if (favoriteRes.ok) {
      booksData.favorite = await favoriteRes.json();
    }

    renderBooks("uploaded");
  } catch (error) {
    console.error("Error loading books:", error);
  }
}

function renderBooks(type) {
  const grid = document.getElementById("books-grid");
  grid.innerHTML = "";

  const books = booksData[type] || [];

  if (books.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 40px;">No ${type} books yet.</p>`;
    return;
  }

  books.forEach(book => {
    const bookCard = createBookCard(book, type);
    grid.appendChild(bookCard);
  });
}

function createBookCard(book, type) {
  const article = document.createElement("article");
  article.className = "book-card";
  article.setAttribute("data-type", type);
  article.setAttribute("data-book-id", book.id);
  if (type === "translated" && book.translation_id) {
    article.setAttribute("data-translation-id", book.translation_id);
  }

  const languageLabel = type === "translated" 
    ? `${book.language} → ${book.target_language}`
    : `${book.language} → ${book.target_language}`;

  let actionButton = "";
  if (type === "uploaded") {
    actionButton = `<button class="book-btn delete-btn" onclick="deleteUploadedBook(${book.id})">Delete</button>`;
  } else if (type === "translated") {
    actionButton = `<button class="book-btn delete-btn" onclick="deleteTranslation(${book.translation_id})">Remove</button>`;
  } else if (type === "favorite") {
    actionButton = `<button class="book-btn delete-btn" onclick="removeFavorite(${book.id})">Remove</button>`;
  }

  article.innerHTML = `
    <img class="book-img" src="${book.img_path || '../assets/book1.png'}" alt="${book.name}" />
    <h3 class="book-title">${book.name}</h3>
    <p class="book-author">By ${book.author || 'Unknown'}</p>
    <p class="book-meta">${languageLabel}</p>
    <div class="book-actions">
      <button class="book-btn" onclick="handlePreview('${book.name}')">Preview</button>
      ${actionButton}
    </div>
  `;

  return article;
}

async function switchBooksTab(name) {
  document.querySelectorAll(".tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === name);
  });

  renderBooks(name);
}

function handlePreview(title) {
  alert("Preview for: " + title);
}

async function deleteUploadedBook(bookId) {
  if (!confirm("Are you sure you want to delete this uploaded book?")) return;

  try {
    const response = await fetch(`${API_BASE}/profile/uploaded-books/${bookId}`, {
      method: "DELETE",
      headers: authHeaders()
    });

    if (response.ok) {
      booksData.uploaded = booksData.uploaded.filter(b => b.id !== bookId);
      renderBooks("uploaded");
      alert("Book deleted successfully");
    } else {
      alert("Failed to delete book");
    }
  } catch (error) {
    console.error("Error deleting book:", error);
    alert("Error deleting book");
  }
}

async function deleteTranslation(translationId) {
  if (!confirm("Are you sure you want to remove this translation?")) return;

  try {
    const response = await fetch(`${API_BASE}/profile/translated-books/${translationId}`, {
      method: "DELETE",
      headers: authHeaders()
    });

    if (response.ok) {
      booksData.translated = booksData.translated.filter(b => b.translation_id !== translationId);
      renderBooks("translated");
      alert("Translation removed successfully");
    } else {
      alert("Failed to remove translation");
    }
  } catch (error) {
    console.error("Error deleting translation:", error);
    alert("Error removing translation");
  }
}

async function removeFavorite(bookId) {
  if (!confirm("Are you sure you want to remove this from favorites?")) return;

  try {
    const response = await fetch(`${API_BASE}/profile/favorites/${bookId}`, {
      method: "DELETE",
      headers: authHeaders()
    });

    if (response.ok) {
      booksData.favorite = booksData.favorite.filter(b => b.id !== bookId);
      renderBooks("favorite");
      alert("Removed from favorites");
    } else {
      alert("Failed to remove from favorites");
    }
  } catch (error) {
    console.error("Error removing favorite:", error);
    alert("Error removing from favorites");
  }
}


document.addEventListener("DOMContentLoaded", () => {
  loadStoredToken();
  loadUserProfile();
  loadAllBooks();
});
