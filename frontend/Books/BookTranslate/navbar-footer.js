function toggleMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  mobileMenu.classList.toggle('show');
}

document.addEventListener('click', function(event) {
  const mobileMenu = document.getElementById('mobileMenu');
  const hamburger = document.querySelector('.hamburger-menu');
  
  if (mobileMenu.classList.contains('show') && 
      !mobileMenu.contains(event.target) && 
      event.target !== hamburger) {
    mobileMenu.classList.remove('show');
  }
});
