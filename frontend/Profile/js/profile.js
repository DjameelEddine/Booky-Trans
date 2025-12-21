const API_BASE = "http://127.0.0.1:8000";


let ACCESS_TOKEN = localStorage.getItem("accessToken") || null;

let booksData = {
  uploaded: [],
  translated: [],
  favorite: []
};

function setToken(token) {
  ACCESS_TOKEN = token;
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
}

function loadStoredToken() {
  const t = localStorage.getItem("accessToken");
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
  try {
    if (ACCESS_TOKEN) {
      const response = await fetch(`${API_BASE}/profile/me`, {
        headers: authHeaders()
      });
      
      if (response.ok) {
        const user = await response.json();
        document.getElementById('user-name').textContent =
          user.full_name || user.username;
        document.getElementById('user-avatar').src =
          user.avatar_url || '../assets/profile.svg';
        document.getElementById('user-avatar').alt =
          user.full_name || user.username;
        document.getElementById('user-description1').textContent =
          user.bio || 'No bio available';
        document.getElementById('user-description2').textContent =
          user.description || '';
        return;
      }
    }
  } catch (error) {
    console.error('JWT failed, trying fallback:', error);
  }

  if (localStorage.getItem('isLoggedIn') === 'true') {
    const email = localStorage.getItem('userEmail') || 'Team User';
    document.getElementById('user-name').textContent = email;
    document.getElementById('user-avatar').src = '../assets/profile.svg';
    document.getElementById('user-avatar').alt = email;
    document.getElementById('user-description1').textContent = 'Welcome back!';
    document.getElementById('user-description2').textContent = 'Team member account';
    return;
  }

  document.getElementById('user-name').textContent = 'Guest User';
  document.getElementById('user-description1').textContent =
    'Please log in to see your profile';
}

function logout() {
  setToken(null);
  window.location.href = "../Home/home.html";
}

async function loadAllBooks() {
  try {
    if (ACCESS_TOKEN) {
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
      return;
    }
  } catch (error) {
    console.error("Backend failed, using demo books:", error);
  }

  booksData = {
    uploaded: [
      { id: 1, name: "Demo Book 1", author: "Demo Author",
        language: "English", target_language: "French",
        img_path: "../assets/book1.png" }
    ],
    translated: [
      { id: 2, name: "Demo Translation", author: "Demo Author",
        language: "English", target_language: "Arabic",
        translation_id: 1, img_path: "../assets/book1.png" }
    ],
    favorite: [
      { id: 3, name: "Demo Favorite", author: "Demo Author",
        language: "French", target_language: "English",
        img_path: "../assets/book1.png" }
    ]
  };
  renderBooks("uploaded");
}

function renderBooks(type) {
  const grid = document.getElementById("books-grid");
  grid.innerHTML = "";

  const books = booksData[type] || [];

  if (books.length === 0) {
    grid.innerHTML =
      `<p style="grid-column: 1/-1; text-align: center; padding: 40px;">
         No ${type} books yet.
       </p>`;
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

  const languageLabel = `${book.language} → ${book.target_language}`;

  let actionButton = "";
  if (type === "uploaded") {
    actionButton =
      `<button class="book-btn delete-btn"
               onclick="deleteUploadedBook(${book.id})">Delete</button>`;
  } else if (type === "translated") {
    actionButton =
      `<button class="book-btn delete-btn"
               onclick="deleteTranslation(${book.translation_id})">Remove</button>`;
  } else if (type === "favorite") {
    actionButton =
      `<button class="book-btn delete-btn"
               onclick="removeFavorite(${book.id})">Remove</button>`;
  }

  article.innerHTML = `
    <img class="book-img"
         src="${book.img_path || '../assets/book1.png'}"
         alt="${book.name}" />
    <h3 class="book-title">${book.name}</h3>
    <p class="book-author">By ${book.author || 'Unknown'}</p>
    <p class="book-meta">${languageLabel}</p>
    <div class="book-actions">
      <button class="book-btn"
              onclick="handlePreview('${book.name}')">Preview</button>
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

  if (ACCESS_TOKEN) {
    try {
      const response = await fetch(`${API_BASE}/profile/uploaded-books/${bookId}`, {
        method: "DELETE",
        headers: authHeaders()
      });

      if (response.ok) {
        booksData.uploaded =
          booksData.uploaded.filter(b => b.id !== bookId);
        renderBooks("uploaded");
        alert("Book deleted successfully");
        return;
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  }

  booksData.uploaded =
    booksData.uploaded.filter(b => b.id !== bookId);
  renderBooks("uploaded");
  alert("Demo book removed");
}

async function deleteTranslation(translationId) {
  if (!confirm("Are you sure you want to remove this translation?")) return;

  if (ACCESS_TOKEN) {
    try {
      const response = await fetch(
        `${API_BASE}/profile/translated-books/${translationId}`, {
          method: "DELETE",
          headers: authHeaders()
        }
      );

      if (response.ok) {
        booksData.translated =
          booksData.translated
            .filter(b => b.translation_id !== translationId);
        renderBooks("translated");
        alert("Translation removed successfully");
        return;
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  }

  booksData.translated =
    booksData.translated
      .filter(b => b.translation_id !== translationId);
  renderBooks("translated");
  alert("Demo translation removed");
}

async function removeFavorite(bookId) {
  if (!confirm("Are you sure you want to remove this from favorites?")) return;

  if (ACCESS_TOKEN) {
    try {
      const response = await fetch(`${API_BASE}/profile/favorites/${bookId}`, {
        method: "DELETE",
        headers: authHeaders()
      });

      if (response.ok) {
        booksData.favorite =
          booksData.favorite.filter(b => b.id !== bookId);
        renderBooks("favorite");
        alert("Removed from favorites");
        return;
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  }

  booksData.favorite =
    booksData.favorite.filter(b => b.id !== bookId);
  renderBooks("favorite");
  alert("Demo favorite removed");
}

document.addEventListener("DOMContentLoaded", () => {
  loadStoredToken();
  loadUserProfile();
  loadAllBooks();
});
