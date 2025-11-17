// header component loader + small helpers
document.addEventListener('DOMContentLoaded', function(){
  // load header HTML into placeholder if present
  const mount = document.getElementById('site-header');
  if(mount){
    fetch('../../components/header/header.html')
      .then(r => r.text())
      .then(html => {
        mount.innerHTML = html;
      })
      .catch(err => {
        console.error('Failed to load header component', err);
      });
  }
});

// toggleMenu must be globally accessible for the inline onclick in the component
function toggleMenu(){
  const el = document.getElementById('mobileMenu');
  if(!el) return;
  el.classList.toggle('show');
}
