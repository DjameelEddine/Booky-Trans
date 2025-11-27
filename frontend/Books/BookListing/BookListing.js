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

function toggleFavorite(btn) {
  btn.classList.toggle("active");
}