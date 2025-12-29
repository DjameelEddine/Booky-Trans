document.addEventListener('DOMContentLoaded', function(){
  // Helper to resolve component paths for both Live Server (workspace root)
  // and Python http.server (frontend as server root)
  function getComponentPath(componentPath) {
    const pathname = window.location.pathname;
    const FRONTEND_TOKEN = '/frontend/';

    // If URL contains /frontend/, build an absolute path to components
    const idx = pathname.indexOf(FRONTEND_TOKEN);
    if (idx !== -1) {
      const base = pathname.substring(0, idx + FRONTEND_TOKEN.length);
      return base + 'components/' + componentPath;
    }

    // Otherwise, compute a relative path from current location
    const segments = pathname.split('/').filter(Boolean);
    // Remove filename segment
    let backToRoot = '';
    for (let i = 0; i < Math.max(segments.length - 1, 0); i++) backToRoot += '../';
    return backToRoot + 'components/' + componentPath;
  }

  const mount = document.getElementById('site-header');
  if(!mount) return;

  if (!document.getElementById('header-component-styles')) {
    const link = document.createElement('link');
    link.id = 'header-component-styles';
    link.rel = 'stylesheet';
    link.href = getComponentPath('header/header.css');
    document.head.appendChild(link);
  }

  fetch(getComponentPath('header/header.html'))
      .then(r => r.text())
      .then(html => {
        mount.innerHTML = html || '';
        const logo = mount.querySelector('#site-logo');
        const mobileLogo = mount.querySelector('#mobile-logo-img');
        // Simplify: calculate the base path to frontend root once
        const logoPrimary = getComponentPath('../assets/icons/logoWHITE.svg');
        const logoFallback = getComponentPath('../assets/icons/logowhite.svg');
        if (logo){
          logo.src = logoPrimary;
          logo.onerror = () => { logo.onerror = null; logo.src = logoFallback; };
        }
        if (mobileLogo){
          mobileLogo.src = logoPrimary;
          mobileLogo.onerror = () => { mobileLogo.onerror = null; mobileLogo.src = logoFallback; };
        }

        wireupHeaderLinks(mount);
        checkLoginStatus(mount);
      })
      .catch(e => console.error('header load failed', e));

  function wireupHeaderLinks(mount){
    mount.querySelectorAll('[data-target]').forEach(el => {
      const target = el.getAttribute('data-target');

      // Set a fallback href so middle-clicks/open-in-new-tab work in many setups
      el.setAttribute('href', '/' + target);

      el.addEventListener('click', ev => {
        ev.preventDefault();
        const mm = document.getElementById('mobileMenu');
        if (mm) mm.classList.remove('show');

        // Build candidate URLs to try in order
        const pathname = window.location.pathname;
        const FRONTEND_TOKEN = '/frontend/';
        const idx = pathname.indexOf(FRONTEND_TOKEN);
        const candidates = [];

        // 1) If URL contains /frontend/, try absolute path under that base
        if (idx !== -1) {
          const base = pathname.substring(0, idx + FRONTEND_TOKEN.length);
          candidates.push(base + target);
        }

        // 2) Try root-prefixed path (works when server root is the frontend folder)
        candidates.push('/' + target);

        // 3) Try a relative path from current location
        const segs = pathname.split('/').filter(Boolean);
        let back = '';
        for (let i = 0; i < Math.max(segs.length - 1, 0); i++) back += '../';
        candidates.push(back + target);

        // Try each candidate and navigate to the first that returns 200
        (async function tryNavigate() {
          for (const url of candidates) {
            try {
              const res = await fetch(url, { method: 'GET' });
              if (res && res.ok) {
                window.location.href = url;
                return;
              }
            } catch (e) {
              // ignore and try next
            }
          }
          // As a last resort, navigate to the first candidate
          window.location.href = candidates[0];
        })();
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
      if (navAvatar) navAvatar.src = getComponentPath('header/../assets/profile.jpg');
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
            navAvatar.src = getComponentPath('header/../assets/profile.jpg');
          }
          navAvatar.alt = user.full_name || "User Profile";
          
          // Cache
          localStorage.setItem("profile_avatar_url", navAvatar.src);
          localStorage.setItem("profile_full_name", user.full_name || "");
        }
      } else {
        // Token invalid - fallback
        const navAvatar = mount.querySelector('.topnav-avatar');
        if (navAvatar) navAvatar.src = getComponentPath('header/../assets/profile.jpg');
      }
    } catch (error) {
      console.error('Navbar avatar failed:', error);
      const navAvatar = mount.querySelector('.topnav-avatar');
      if (navAvatar) navAvatar.src = getComponentPath('header/../assets/profile.jpg');
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
