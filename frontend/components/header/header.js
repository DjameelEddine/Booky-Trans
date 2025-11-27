
document.addEventListener('DOMContentLoaded', function(){

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

function toggleMenu(){
  const el = document.getElementById('mobileMenu');
  if(!el) return;
  el.classList.toggle('show');
}
