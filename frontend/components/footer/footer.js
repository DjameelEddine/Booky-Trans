document.addEventListener('DOMContentLoaded', function(){
  const mount = document.getElementById('site-footer');
  if (!mount) return;

  const frontendRoot = '/frontend/';
  fetch(frontendRoot + 'components/footer/footer.html')
    .then(r => r.text())
    .then(html => {
      mount.innerHTML = html || '';

    })
    .catch(e => {
      console.warn('footer load failed, using fallback', e);
      mount.innerHTML = '<div style="padding:20px;background:#090020;color:#fff;text-align:center">BookyTrans &copy; 2025</div>';
    });
});
