const THEME_STORAGE_KEY = 'uc-theme-choice';

function readStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

function bootstrapTheme() {
  const savedTheme = readStoredTheme();
  if (savedTheme) {
    document.documentElement.dataset.theme = savedTheme;
  }
}

function setThemeChoice(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn('Unable to store theme preference', error);
  }
  document.querySelectorAll('[data-theme-choice]').forEach((button) => {
    const isActive = button.dataset.themeChoice === theme;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

bootstrapTheme();

const loadPartials = async () => {
  const includeTargets = document.querySelectorAll('[data-include]');
  await Promise.all(
    Array.from(includeTargets).map(async (el) => {
      const src = el.dataset.include;
      if (!src) return;
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error(res.statusText);
        el.innerHTML = await res.text();
      } catch (error) {
        console.error(`Failed to load partial ${src}`, error);
      }
    })
  );
};

const highlightActiveNavLink = () => {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    const normalizedHref = href.split('#')[0] || 'index.html';
    link.classList.toggle('active', normalizedHref === currentPath);
  });
};

const initThemePicker = () => {
  const themeButtons = document.querySelectorAll('[data-theme-choice]');
  if (!themeButtons.length) return;
  const savedTheme = readStoredTheme() || document.documentElement.dataset.theme || 'soft-green';
  setThemeChoice(savedTheme);
  themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const choice = button.dataset.themeChoice;
      if (choice) {
        setThemeChoice(choice);
      }
    });
  });
};

const initReviewForm = () => {
  const reviewForm = document.getElementById('reviewForm');
  if (!reviewForm) return;

  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(reviewForm);

    try {
      await fetch(reviewForm.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      });

      reviewForm.reset();
      alert('Thank you! Your review has been sent successfully.');
    } catch (error) {
      alert('Sorry, there was an error sending your review. Please try again.');
    }
  });
};

const initCarousels = () => {
  const axisQuery = window.matchMedia('(max-width: 720px)');

  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('[data-carousel-track]');
    if (!track) return;

    const slides = Array.from(track.children);
    const indicators = Array.from(carousel.querySelectorAll('[data-carousel-indicator]'));
    const prev = carousel.querySelector('.carousel-control.prev');
    const next = carousel.querySelector('.carousel-control.next');
    const windowEl = carousel.querySelector('.carousel-window');
    const interval = Number(carousel.dataset.carouselInterval) || 6000;
    let index = 0;
    let timer;

    const updateWindowHeight = () => {
      if (!windowEl) return;
      if (axisQuery.matches && slides[index]) {
        windowEl.style.height = `${slides[index].offsetHeight}px`;
      } else {
        windowEl.style.height = '';
      }
    };

    const setActive = (idx) => {
      const offset = (idx + slides.length) % slides.length;
      const slide = slides[offset];
      if (!slide) return;
      if (axisQuery.matches) {
        const baseTop = slides[0]?.offsetTop || 0;
        track.style.transform = `translateY(-${slide.offsetTop - baseTop}px)`;
      } else {
        const baseLeft = slides[0]?.offsetLeft || 0;
        track.style.transform = `translateX(-${slide.offsetLeft - baseLeft}px)`;
      }
      indicators.forEach((btn, i) => btn.classList.toggle('active', i === offset));
      index = offset;
      updateWindowHeight();
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

    const handleAxisChange = () => {
      setActive(index);
    };

    if (axisQuery.addEventListener) {
      axisQuery.addEventListener('change', handleAxisChange);
    } else if (axisQuery.addListener) {
      axisQuery.addListener(handleAxisChange);
    }
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadPartials();
  highlightActiveNavLink();
  initThemePicker();
  initReviewForm();
  initCarousels();
});
