// shrink the bar after you scroll 30 px
const bar = document.querySelector('.top-bar');
window.addEventListener('scroll', () => bar.classList.toggle('shrink', window.scrollY > 30));
