document.addEventListener('DOMContentLoaded', function(){
  const mount = document.getElementById('site-header');
  if(!mount) return;

  // Use absolute frontend root so pages in subfolders can fetch the component reliably.
  // Adjust this if your site is served from a subpath.
  const frontendRoot = '/frontend/';

  // fetch and inject header.html (absolute path)
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
      })
      .catch(e => console.error('header load failed', e));

  function wireupHeaderLinks(mount, frontendRoot){
    mount.querySelectorAll('[data-target]').forEach(el => {
      const target = el.getAttribute('data-target');
      const resolved = frontendRoot + target;
      el.setAttribute('href', resolved);
      el.addEventListener('click', ev => {
        if (el.tagName.toLowerCase() === 'a' && el.href) return; // let browser handle it
        ev.preventDefault();
        const mm = document.getElementById('mobileMenu');
        if (mm) mm.classList.remove('show');
        window.location.href = resolved;
      });
    });

    // hamburger toggle
    window.toggleMenu = function(){
      const mm = document.getElementById('mobileMenu');
      if (!mm) return;
      mm.classList.toggle('show');
    };
  }
});
