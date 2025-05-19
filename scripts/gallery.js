let currentIndex = 0;
let images = [];

// Function to open the lightbox
function openLightbox(index) {
    currentIndex = index;
    images = document.querySelectorAll(".gallery-grid img");

    document.getElementById("lightbox-img").src = images[currentIndex].src;
    document.getElementById("lightbox").style.display = "flex";
}

// Function to close the lightbox
function closeLightbox() {
    document.getElementById("lightbox").style.display = "none";
}

// Function to change slides (left/right navigation)
function changeSlide(step) {
    currentIndex += step;

    if (currentIndex < 0) {
        currentIndex = images.length - 1; // Loop back to last image
    } else if (currentIndex >= images.length) {
        currentIndex = 0; // Loop back to first image
    }

    document.getElementById("lightbox-img").src = images[currentIndex].src;
}

document.addEventListener('keydown', e => {
  if (lightbox.style.display !== 'flex') return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') changeSlide(1);
  if (e.key === 'ArrowLeft')  changeSlide(-1);
});
