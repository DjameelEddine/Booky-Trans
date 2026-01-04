const API_BASE_URL = 'https://booky-trans.onrender.com';

document.querySelector('.get-started-btn').addEventListener('click', async function() {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
        window.location.href = '../Books/BookListing/BooksListing.html';
    } else {
        window.location.href = '../Authentication/Signup/signup.html';
    }
});