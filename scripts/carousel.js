/*  Home-page Blog Carousel • 2025-05-19  */
const track   = document.querySelector('.carousel-track');
const slides  = Array.from(track.children);

/* new arrow selectors (in control-bar) */
const prevBtn = document.querySelector('.carousel-controls .prev');
const nextBtn = document.querySelector('.carousel-controls .next');

let index = 0;

/* ------------------------------------------------ helpers */
function go(i){
  index = (i + slides.length) % slides.length;
  track.style.transform = `translateX(-${index * track.clientWidth}px)`;
}
const next = () => go(index + 1);
const prev = () => go(index - 1);

/* ------------------------------------------------ auto-cycle */
let timer;
function startTimer(){
  clearInterval(timer);
  timer = setInterval(next, 5000);
}
startTimer();

/* ------------------------------------------------ listeners */
addEventListener('resize', () => go(index));       // keep offset

nextBtn.addEventListener('click', () => { next(); startTimer(); });
prevBtn.addEventListener('click', () => { prev(); startTimer(); });

addEventListener('keydown', e => {
  if (e.key === 'ArrowRight'){ next(); startTimer(); }
  if (e.key === 'ArrowLeft') { prev(); startTimer(); }
});

/* swipe (simple) */
let startX = null;
track.addEventListener('pointerdown', e => startX = e.clientX);
track.addEventListener('pointerup',   e => {
  if (startX === null) return;
  const dx = e.clientX - startX;
  if (dx >  40) prev();
  if (dx < -40) next();
  startTimer();
  startX = null;
});
