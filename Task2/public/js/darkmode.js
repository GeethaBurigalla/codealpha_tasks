function toggleDark() {
  document.body.classList.toggle('dark');
  let isDark = document.body.classList.contains('dark');
  localStorage.setItem('darkMode', isDark);
  let btn = document.querySelector('.dark-toggle');
  btn.textContent = isDark ? '☀️' : '🌙';
}

// Apply saved dark mode on page load
window.onload = function() {
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
    let btn = document.querySelector('.dark-toggle');
    if (btn) btn.textContent = '☀️';
  }
}