document.addEventListener('DOMContentLoaded', function(){
  const mount = document.getElementById('site-footer');
  if (!mount) return;

  // Inject CSS if not already present
  if (!document.getElementById('footer-component-styles')) {
    const link = document.createElement('link');
    link.id = 'footer-component-styles';
    link.rel = 'stylesheet';
    link.href = '/frontend/components/footer/footer.css';
    document.head.appendChild(link);
  }

  const frontendRoot = '/frontend/';
  fetch(frontendRoot + 'components/footer/footer.html')
    .then(r => r.text())
    .then(html => {
      mount.innerHTML = html || '';
      wireupFooterLinks(mount, frontendRoot);
    })
    .catch(e => {
      console.warn('footer load failed, using fallback', e);
      mount.innerHTML = '<div style="padding:20px;background:#090020;color:#fff;text-align:center">BookyTrans &copy; 2025</div>';
    });

  function wireupFooterLinks(mount, frontendRoot){
    mount.querySelectorAll('[data-target]').forEach(el => {
      const target = el.getAttribute('data-target');
      const resolved = frontendRoot + target;
      el.setAttribute('href', resolved);
      el.addEventListener('click', ev => {
        if (el.tagName.toLowerCase() === 'a' && el.href) return;
        ev.preventDefault();
        window.location.href = resolved;
      });
    });
  }
});
