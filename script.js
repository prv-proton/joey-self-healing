// Review form handler (only runs when form exists)
const reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    try {
      await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      form.reset();
      alert('Thank you! Your review has been sent successfully.');
    } catch (error) {
      alert('Sorry, there was an error sending your review. Please try again.');
    }
  });
}

// Simple carousel controller
(() => {
  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('[data-carousel-track]');
    if (!track) return;

    const slides = Array.from(track.children);
    const indicators = Array.from(carousel.querySelectorAll('[data-carousel-indicator]'));
    const prev = carousel.querySelector('.carousel-control.prev');
    const next = carousel.querySelector('.carousel-control.next');
    const interval = Number(carousel.dataset.carouselInterval) || 6000;
    let index = 0;
    let timer;

    const setActive = (idx) => {
      const offset = (idx + slides.length) % slides.length;
      track.style.transform = `translateX(-${offset * 100}%)`;
      indicators.forEach((btn, i) => btn.classList.toggle('active', i === offset));
      index = offset;
    };

    const queueAutoAdvance = () => {
      clearInterval(timer);
      timer = setInterval(() => setActive(index + 1), interval);
    };

    prev?.addEventListener('click', () => {
      setActive(index - 1);
      queueAutoAdvance();
    });

    next?.addEventListener('click', () => {
      setActive(index + 1);
      queueAutoAdvance();
    });

    indicators.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        setActive(i);
        queueAutoAdvance();
      });
    });

    carousel.addEventListener('mouseenter', () => clearInterval(timer));
    carousel.addEventListener('mouseleave', queueAutoAdvance);

    setActive(0);
    queueAutoAdvance();
  });
})();
