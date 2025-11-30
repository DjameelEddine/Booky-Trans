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

  function checkLoginStatus(mount){
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const authButtons = mount.querySelector('#authButtons');
    const userProfile = mount.querySelector('#userProfile');
    
    if (isLoggedIn && authButtons && userProfile) {
      authButtons.style.display = 'none';
      userProfile.style.display = 'flex';
    } else if (authButtons && userProfile) {
      authButtons.style.display = 'flex';
      userProfile.style.display = 'none';
    }
  }
});
