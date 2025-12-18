document.addEventListener('DOMContentLoaded', function(){
  const mount = document.getElementById('site-header');
  if(!mount) return;

  
  const frontendRoot = '/frontend/';

  fetch(frontendRoot + 'components/header/header.html')
      .then(r => r.text())
      .then(html => {
        mount.innerHTML = html || '';
        const logo = mount.querySelector('#site-logo');
        const mobileLogo = mount.querySelector('#mobile-logo-img');
        const logoPrimary = frontendRoot + 'assets/icons/logoWHITE.svg';
        const logoFallback = frontendRoot + 'assets/icons/logowhite.svg';
        if (logo){
          logo.src = logoPrimary;
          logo.onerror = () => { logo.src = logoFallback; };
        }
        if (mobileLogo){
          mobileLogo.src = logoPrimary;
          mobileLogo.onerror = () => { mobileLogo.src = logoFallback; };
        }

        wireupHeaderLinks(mount, frontendRoot);
        checkLoginStatus(mount);
      })
      .catch(e => console.error('header load failed', e));

  function wireupHeaderLinks(mount, frontendRoot){
    mount.querySelectorAll('[data-target]').forEach(el => {
      const target = el.getAttribute('data-target');
      const resolved = frontendRoot + target;
      el.setAttribute('href', resolved);
      el.addEventListener('click', ev => {
        if (el.tagName.toLowerCase() === 'a' && el.href) return; 
        ev.preventDefault();
        const mm = document.getElementById('mobileMenu');
        if (mm) mm.classList.remove('show');
        window.location.href = resolved;
      });
    });

    window.toggleMenu = function(){
      const mm = document.getElementById('mobileMenu');
      if (!mm) return;
      mm.classList.toggle('show');
    };
  }

  async function checkLoginStatus(mount){
    const token = localStorage.getItem('accessToken');
    const authButtons = mount.querySelector('#authButtons');
    const userProfile = mount.querySelector('#userProfile');
    
    if (token) {
      try {
        const response = await fetch('http://127.0.0.1:8000/auth/verify-token', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          if (authButtons) authButtons.style.display = 'none';
          if (userProfile) userProfile.style.display = 'flex';
          return;
        } else {
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('username');
        }
      } catch (error) {
        console.error('Error verifying token:', error);
      }
    }
    
    if (authButtons) authButtons.style.display = 'flex';
    if (userProfile) userProfile.style.display = 'none';
  }
});
