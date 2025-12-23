document.addEventListener('DOMContentLoaded', function(){
  // Helper to resolve paths from any page location
  function getComponentPath(componentPath) {
    const currentPath = window.location.pathname;
    const pathDepth = (currentPath.split('/').length - 2);
    let backToRoot = '';
    for (let i = 0; i < pathDepth; i++) backToRoot += '../';
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
      const currentPath = window.location.pathname;
      const pathDepth = (currentPath.split('/').length - 2);
      let backToRoot = '';
      for (let i = 0; i < pathDepth; i++) backToRoot += '../';
      const resolved = backToRoot + target;
      el.setAttribute('href', resolved);
      el.addEventListener('click', ev => {
        if (el.tagName.toLowerCase() === 'a' && el.href) return;
        ev.preventDefault();
        window.location.href = resolved;
      });
    });
  }
});
