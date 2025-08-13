// Shared site interactions (hamburger, etc.)
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const menu = document.querySelector('.nav-menu');
  if (hamburger && menu) {
    hamburger.addEventListener('click', () => {
      menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';
    });
  }
});
