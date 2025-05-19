// shrink the bar after you scroll 30 px
// reveal nav only after hero is off-screen
const sentinel = document.querySelector('#hero-sentinel');
const bar      = document.querySelector('.top-bar');

if (sentinel && bar) {
  const io = new IntersectionObserver(([entry]) => {
    bar.classList.toggle('reveal', !entry.isIntersecting);
  }, { threshold: 0 });

  io.observe(sentinel);
}
