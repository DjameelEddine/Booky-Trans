document.addEventListener('DOMContentLoaded', function(){
  // Helper to resolve component paths for both Live Server (workspace root)
  // and Python http.server (frontend as server root)
  function getComponentPath(componentPath) {
    const pathname = window.location.pathname;
    const FRONTEND_TOKEN = '/frontend/';

    const idx = pathname.indexOf(FRONTEND_TOKEN);
    if (idx !== -1) {
      const base = pathname.substring(0, idx + FRONTEND_TOKEN.length);
      return base + 'components/' + componentPath;
    }

    const segments = pathname.split('/').filter(Boolean);
    let backToRoot = '';
    for (let i = 0; i < Math.max(segments.length - 1, 0); i++) backToRoot += '../';
    return backToRoot + 'components/' + componentPath;
  }

  const mount = document.getElementById('site-footer');
  if (!mount) return;

  // Inject CSS if not already present
  if (!document.getElementById('footer-component-styles')) {
    const link = document.createElement('link');
    link.id = 'footer-component-styles';
    link.rel = 'stylesheet';
    link.href = getComponentPath('footer/footer.css');
    document.head.appendChild(link);
  }

  fetch(getComponentPath('footer/footer.html'))
    .then(r => r.text())
    .then(html => {
      mount.innerHTML = html || '';
      wireupFooterLinks(mount);
    })
    .catch(e => {
      console.warn('footer load failed, using fallback', e);
      mount.innerHTML = '<div style="padding:20px;background:#090020;color:#fff;text-align:center">BookyTrans &copy; 2025</div>';
    });

  function wireupFooterLinks(mount){
    mount.querySelectorAll('[data-target]').forEach(el => {
      const target = el.getAttribute('data-target');

      // Fallback href
      el.setAttribute('href', '/' + target);

      el.addEventListener('click', ev => {
        ev.preventDefault();

        const pathname = window.location.pathname;
        const FRONTEND_TOKEN = '/frontend/';
        const idx = pathname.indexOf(FRONTEND_TOKEN);
        const candidates = [];

        if (idx !== -1) {
          const base = pathname.substring(0, idx + FRONTEND_TOKEN.length);
          candidates.push(base + target);
        }

        candidates.push('/' + target);

        const segs = pathname.split('/').filter(Boolean);
        let back = '';
        for (let i = 0; i < Math.max(segs.length - 1, 0); i++) back += '../';
        candidates.push(back + target);

        (async function tryNavigate() {
          for (const url of candidates) {
            try {
              const res = await fetch(url, { method: 'GET' });
              if (res && res.ok) {
                window.location.href = url;
                return;
              }
            } catch (e) {}
          }
          window.location.href = candidates[0];
        })();
      });
    });
  }
});
