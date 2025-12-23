document.addEventListener('DOMContentLoaded', function(){
  const mount = document.getElementById('site-header');
  if(!mount) return;

  if (!document.getElementById('header-component-styles')) {
    const link = document.createElement('link');
    link.id = 'header-component-styles';
    link.rel = 'stylesheet';
    link.href = '/frontend/components/header/header.css';
    document.head.appendChild(link);
  }
  
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

  async function updateNavbarAvatar(mount) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      const navAvatar = mount.querySelector('.topnav-avatar');
      if (navAvatar) navAvatar.src = "/frontend/assets/profile.jpg";
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/profile/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const user = await response.json();
        const navAvatar = mount.querySelector('.topnav-avatar');  
        
        if (navAvatar) {
         
          if (user.avatar_url && user.avatar_url.startsWith('/uploads/')) {
            navAvatar.src = `http://127.0.0.1:8000${user.avatar_url}`;
          } else {
            navAvatar.src = "/frontend/assets/profile.jpg";
          }
          navAvatar.alt = user.full_name || "User Profile";
          
          // Cache
          localStorage.setItem("profile_avatar_url", navAvatar.src);
          localStorage.setItem("profile_full_name", user.full_name || "");
        }
      } else {
        // Token invalid - fallback
        const navAvatar = mount.querySelector('.topnav-avatar');
        if (navAvatar) navAvatar.src = "/frontend/assets/profile.jpg";
      }
    } catch (error) {
      console.error('Navbar avatar failed:', error);
      const navAvatar = mount.querySelector('.topnav-avatar');
      if (navAvatar) navAvatar.src = "/frontend/assets/profile.jpg";
    }
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
          
          updateNavbarAvatar(mount); 
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
    
    updateNavbarAvatar(mount);  
  }

  
  window.addEventListener('storage', function(e) {
    if (e.key === 'accessToken' || e.key === 'profile_avatar_url') {
      const mount = document.getElementById('site-header');
      if (mount) updateNavbarAvatar(mount);
    }
  });
});
