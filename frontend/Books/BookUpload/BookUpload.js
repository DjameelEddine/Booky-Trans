function toggleMenu() {
    document.getElementById("mobileMenu").classList.toggle("show");
}

const API_BASE = "https://booky-trans.onrender.com";
let ACCESS_TOKEN = null;

function loadStoredToken() {
    ACCESS_TOKEN = localStorage.getItem("accessToken");
    // To test upload, independently of login, uncomment the line below and provide a valid token
    // ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3NjU5OTgyMDl9.dijdSIjWwWMYNNSojOYT8K58IM_j9_2RAXdNeY-9N-8";
}

function toggleMenu() {
    document.getElementById("mobileMenu").classList.toggle("show");
}

function updateBookLabel(file, uploadArea) {
    uploadArea.innerHTML = `
        <p>✅ ${file.name}</p>
        <small>Size: ${(file.size / 1024 / 1024).toFixed(2)} MB</small>
    `;
}

// When page loads
document.addEventListener("DOMContentLoaded", () => {
    loadStoredToken();
    
    const form = document.querySelector('form');
    const bookFileInput = document.getElementById('book-upload');
    const coverFileInput = document.getElementById('book-cover');
    const bookUploadArea = document.querySelectorAll('.book-upload')[0];
    const coverUploadArea = document.querySelectorAll('.book-upload')[1];
    
    // Show book file name when selected
    bookFileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            updateBookLabel(this.files[0], bookUploadArea);
        }
    });
    
    // Show cover file name when selected
    coverFileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            updateBookLabel(this.files[0], coverUploadArea);
        }
    });
    
    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 1. Check if user is logged in
        if (!ACCESS_TOKEN) {
            alert("Please login to upload a book");
            window.location.href = "../../Authentication/Login/login.html";
            return;
        }
        
        // 2. Get form values
        const bookName = document.getElementById('book-name').value;
        const bookAuthor = document.getElementById('book-author').value;
        const bookCategory = document.getElementById('book-category').value;
        const bookDescription = document.getElementById('book-description').value;
        const bookLanguage = document.getElementById('book-language').value;
        const targetLanguage = document.getElementById('target-language').value;
        const bookFile = bookFileInput.files[0];
        const coverFile = coverFileInput.files[0] || null;
        
        // 3. Validate required fields
        if (!bookFile) {
            alert("Please select a book file");
            return;
        }
        
        // 4. Validate checkboxes
        if (!document.getElementById('uplaod-permission').checked ||
            !document.getElementById('open-licence').checked) {
            alert("Please confirm both permissions");
            return;
        }
        
        // 5. Create FormData for backend
        const formData = new FormData();
        formData.append('file', bookFile);
        if (coverFile) formData.append('img', coverFile);
        formData.append('name', bookName);
        formData.append('author', bookAuthor);
        formData.append('category', bookCategory);
        formData.append('description', bookDescription);
        formData.append('language', bookLanguage);
        formData.append('target_language', targetLanguage);
        
        // Show loading
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Uploading...';
        submitBtn.disabled = true;
        
        try {
            // 6. Send to backend
            const response = await fetch(`${API_BASE}/books/upload`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${ACCESS_TOKEN}`
                },
                body: formData
            });
            
            // 7. Handle response
            if (response.ok) {
                const result = await response.json();
                alert("Book uploaded successfully!");
                
                // Reset form
                form.reset();
                
                // Reset upload areas
                bookUploadArea.innerHTML = 
                    '<p>📘 Click or Drag your file here to upload</p><small>Supported formats: PDF, EPUB, TXT</small>';
                coverUploadArea.innerHTML = 
                    '<p>📘 Click or Drag your book cover here to upload</p><small>Supported formats: PNG, JPG, JPEG</small>';
                    
            } else {
                const error = await response.json();
                alert(`Upload failed: ${error.detail || 'Server error'}`);
            }
            
        } catch (error) {
            alert("Network error. Please try again.");
        } finally {
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
});