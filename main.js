const THEME_STORAGE_KEY = 'uc-theme-choice';
const DEFAULT_THEME = 'lavender';

function readStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

function bootstrapTheme() {
  document.documentElement.dataset.theme = DEFAULT_THEME;
}

function setThemeChoice(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn('Unable to store theme preference', error);
  }
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

const REVIEWS_HASH = '#reviews';
const DEFAULT_SCROLL_OFFSET = 200;
const DEFAULT_COMING_SOON_MESSAGE =
  'Thanks for your interest! This feature is coming soon in the public release.';

const scrollWithOffset = (selector, behavior = 'smooth') => {
  const target = document.querySelector(selector);
  if (!target) return;
  const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
  const header = document.querySelector('.site-header');
  const headerOffset = header ? header.getBoundingClientRect().height - 120 : DEFAULT_SCROLL_OFFSET;
  const offsetPosition = Math.max(targetPosition - headerOffset, 0);
  window.scrollTo({ top: offsetPosition, behavior });
};

const isSameDocumentLink = (href) => {
  if (!href) return false;
  if (href.startsWith('#')) return true;
  const [path] = href.split('#');
  const current = window.location.pathname.split('/').pop() || 'index.html';
  return path === '' || path === current;
};

const initReviewAnchors = () => {
  const reviewLinks = document.querySelectorAll('a[href$="#reviews"]');
  reviewLinks.forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (!isSameDocumentLink(href)) return;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      scrollWithOffset(REVIEWS_HASH);
      history.replaceState(null, '', REVIEWS_HASH);
    });
  });

  const handleHash = () => {
    if (window.location.hash === REVIEWS_HASH) {
      scrollWithOffset(REVIEWS_HASH, 'auto');
    }
  };

  const handleHashDeferred = () => {
    setTimeout(handleHash, 100);
  };

  handleHashDeferred();
  window.addEventListener('hashchange', handleHashDeferred);
};

const initMobileNav = () => {
  document.querySelectorAll('.nav').forEach((nav) => {
    const toggle = nav.querySelector('.nav-toggle');
    if (!toggle) return;
    const closeMenu = () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    nav.querySelectorAll('.nav-links a, .nav-actions a').forEach((link) => {
      link.addEventListener('click', () => closeMenu());
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

const initFlipbooks = () => {
  const TRANSITION_DURATION = 400;

  document.querySelectorAll('[data-flipbook]').forEach((book) => {
    const spreads = Array.from(book.querySelectorAll('.reader-spread'));
    if (!spreads.length) return;
    const pages = Array.from(book.querySelectorAll('.reader-page'));
    const bookStage = book.querySelector('.reader-book');
    const root = book.closest('[data-flip-root]') || book.parentElement || document;
    const prevButtons = Array.from(book.querySelectorAll('[data-flip-prev]'));
    const nextButtons = Array.from(book.querySelectorAll('[data-flip-next]'));
    const currentEl = root.querySelector('[data-flip-current]');
    const totalEl = root.querySelector('[data-flip-total]');
    const progressEl = root.querySelector('[data-flip-progress]');
    const zoomButtons = Array.from(book.querySelectorAll('[data-flip-zoom]'));
    const zoomLevels = [0.85, 1, 1.15, 1.3];
    let zoomIndex = 1;
    let index = Math.max(
      0,
      spreads.findIndex((spread) => spread.classList.contains('is-active'))
    );
    const mobileSinglePageQuery = window.matchMedia('(max-width: 720px)');
    const forceSinglePageMode = root?.dataset.flipSinglePage === 'true';
    let singlePageSide = 0;
    let isTransitioning = false;
    const totalSpreads = spreads.length;

    const highestPage =
      pages.reduce((max, page) => {
        const num = Number(page.dataset.page);
        if (Number.isFinite(num)) {
          return Math.max(max, num);
        }
        return max;
      }, 0) || totalSpreads * 2;

    if (totalEl) totalEl.textContent = highestPage;
    if (!book.hasAttribute('tabindex')) {
      book.setAttribute('tabindex', '0');
    }

    const getPageNumbers = (spread) =>
      Array.from(spread.querySelectorAll('.reader-page'))
        .map((page) => {
          const pageNum = Number(page.dataset.page);
          return Number.isFinite(pageNum) ? pageNum : null;
        })
        .filter((num) => num !== null)
        .sort((a, b) => a - b);

    const isSinglePageMode = () => forceSinglePageMode || mobileSinglePageQuery.matches;

    const getPagesInSpread = (spread) => Array.from(spread?.querySelectorAll('.reader-page') || []);

    const clampSinglePageSide = () => {
      const pagesInSpread = getPagesInSpread(spreads[index]);
      if (!pagesInSpread.length) {
        singlePageSide = 0;
        return;
      }
      if (singlePageSide >= pagesInSpread.length) {
        singlePageSide = Math.max(0, pagesInSpread.length - 1);
      }
    };

    const formatPageLabel = (spread) => {
      const numbers = getPageNumbers(spread);
      if (!numbers.length) return `${index + 1}`;
      const first = numbers[0];
      const last = numbers[numbers.length - 1];
      return first === last ? String(first) : `${first}–${last}`;
    };

    const getCurrentPageNumber = () => {
      const spread = spreads[index];
      if (!spread) return 0;
      const numbers = getPageNumbers(spread);
      if (!numbers.length) {
        const base = index * 2 + 1;
        return isSinglePageMode() ? base + singlePageSide : base + 1;
      }
      if (!isSinglePageMode()) {
        return numbers[numbers.length - 1];
      }
      const clampedSide = Math.min(singlePageSide, numbers.length - 1);
      return numbers[clampedSide];
    };

    const isAtFirstPage = () => {
      if (!isSinglePageMode()) {
        return index === 0;
      }
      return getCurrentPageNumber() <= 1;
    };

    const isAtLastPage = () => {
      if (!isSinglePageMode()) {
        return index === totalSpreads - 1;
      }
      return getCurrentPageNumber() >= highestPage;
    };

    const startTransition = () => {
      if (isTransitioning) return false;
      isTransitioning = true;
      setTimeout(() => {
        isTransitioning = false;
      }, TRANSITION_DURATION);
      return true;
    };

    const setSpreadIndex = (targetIndex) => {
      const clamped = Math.max(0, Math.min(targetIndex, totalSpreads - 1));
      if (clamped === index) return false;
      if (!startTransition()) return false;
      index = clamped;
      singlePageSide = 0;
      updateSpreadState();
      return true;
    };

    const goToNextPage = () => {
      if (!isSinglePageMode()) {
        setSpreadIndex(index + 1);
        return;
      }
      const pagesInSpread = getPagesInSpread(spreads[index]);
      const hasNextPageInSpread = singlePageSide + 1 < pagesInSpread.length;
      if (hasNextPageInSpread) {
        if (!startTransition()) return;
        singlePageSide += 1;
        updateSpreadState();
        return;
      }
      if (index >= totalSpreads - 1) return;
      if (!startTransition()) return;
      index += 1;
      singlePageSide = 0;
      updateSpreadState();
    };

    const goToPrevPage = () => {
      if (!isSinglePageMode()) {
        setSpreadIndex(index - 1);
        return;
      }
      if (singlePageSide > 0) {
        if (!startTransition()) return;
        singlePageSide -= 1;
        updateSpreadState();
        return;
      }
      if (index <= 0) return;
      if (!startTransition()) return;
      index -= 1;
      const previousPages = getPagesInSpread(spreads[index]);
      singlePageSide = previousPages.length > 1 ? previousPages.length - 1 : 0;
      updateSpreadState();
    };

    const updateSpreadState = () => {
      clampSinglePageSide();
      spreads.forEach((spread, spreadIndex) => {
        const isActive = spreadIndex === index;
        const isPrev = spreadIndex < index;
        const isNext = spreadIndex > index;
        spread.classList.toggle('is-active', isActive);
        spread.classList.toggle('is-prev', isPrev);
        spread.classList.toggle('is-next', isNext);
        spread.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        const pagesInSpread = getPagesInSpread(spread);
        pagesInSpread.forEach((page, pageIdx) => {
          const shouldShow = !isSinglePageMode()
            ? isActive
            : isActive && pageIdx === singlePageSide;
          page.hidden = !shouldShow;
        });
      });

      if (currentEl) {
        currentEl.textContent = isSinglePageMode()
          ? String(getCurrentPageNumber())
          : formatPageLabel(spreads[index]);
      }

      if (progressEl) {
        const numbers = getPageNumbers(spreads[index]);
        let pageMarker;
        if (isSinglePageMode()) {
          pageMarker = getCurrentPageNumber();
        } else {
          pageMarker = numbers.length ? numbers[numbers.length - 1] : index + 1;
        }
        const percent =
          highestPage > 1 ? ((pageMarker - 1) / (highestPage - 1)) * 100 : 100;
        progressEl.style.width = `${percent}%`;
      }

      prevButtons.forEach((btn) => {
        btn.disabled = isAtFirstPage();
      });
      nextButtons.forEach((btn) => {
        btn.disabled = isAtLastPage();
      });
    };

    const handleModeChange = () => {
      singlePageSide = 0;
      clampSinglePageSide();
      updateSpreadState();
    };

    if (!forceSinglePageMode) {
      if (mobileSinglePageQuery.addEventListener) {
        mobileSinglePageQuery.addEventListener('change', handleModeChange);
      } else if (mobileSinglePageQuery.addListener) {
        mobileSinglePageQuery.addListener(handleModeChange);
      }
    }

    prevButtons.forEach((btn) => btn.addEventListener('click', goToPrevPage));
    nextButtons.forEach((btn) => btn.addEventListener('click', goToNextPage));

    book.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPrevPage();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNextPage();
      }
    });

    const applyZoom = () => {
      if (!bookStage) return;
      bookStage.style.setProperty('--reader-scale', zoomLevels[zoomIndex]);
      zoomButtons.forEach((btn) => {
        const dir = btn.dataset.flipZoom;
        if (dir === 'in') {
          btn.disabled = zoomIndex === zoomLevels.length - 1;
        } else if (dir === 'out') {
          btn.disabled = zoomIndex === 0;
        }
      });
    };

    zoomButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.dataset.flipZoom === 'in') {
          zoomIndex = Math.min(zoomIndex + 1, zoomLevels.length - 1);
        } else {
          zoomIndex = Math.max(0, zoomIndex - 1);
        }
        applyZoom();
      });
    });

    applyZoom();
    updateSpreadState();
  });
};

const initSectionNavigation = () => {
  const sections = Array.from(document.querySelectorAll('section'));
  const header = document.querySelector('.site-header');
  if (!sections.length) return;

  let currentSectionIndex = 0;

  const scrollToSection = (index, behavior = 'smooth') => {
    const section = sections[index];
    if (!section) return;
    
    const targetPosition = section.getBoundingClientRect().top + window.pageYOffset;
    const headerOffset = header ? header.getBoundingClientRect().height + 20 : 100;
    const offsetPosition = Math.max(targetPosition - headerOffset, 0);
    
    window.scrollTo({ top: offsetPosition, behavior });
    currentSectionIndex = index;
  };

  const updateCurrentSection = () => {
    const scrollPosition = window.pageYOffset + window.innerHeight / 2;
    
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const sectionTop = section.getBoundingClientRect().top + window.pageYOffset;
      
      if (scrollPosition >= sectionTop) {
        currentSectionIndex = i;
        break;
      }
    }
  };

  window.addEventListener('scroll', updateCurrentSection);
  updateCurrentSection();
};

const initFlipbookHeaderVisibility = () => {
  const header = document.querySelector('.site-header');
  const flipbookSection = document.querySelector('.flipbook-section');
  if (!header || !flipbookSection) return;

  const setHidden = (hidden) => {
    header.classList.toggle('is-hidden', hidden);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setHidden(entry.isIntersecting));
      },
      { threshold: 0.2 }
    );
    observer.observe(flipbookSection);
    return;
  }

  const handleVisibility = () => {
    const rect = flipbookSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const isVisible = rect.top < viewportHeight && rect.bottom > 0;
    setHidden(isVisible);
  };

  handleVisibility();
  window.addEventListener('scroll', handleVisibility);
  window.addEventListener('resize', handleVisibility);
};

const initComingSoonLinks = () => {
  const elements = document.querySelectorAll('[data-coming-soon]');
  if (!elements.length) return;

  elements.forEach((el) => {
    const message = el.dataset.comingSoon?.trim() || DEFAULT_COMING_SOON_MESSAGE;
    el.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      alert(message);
    });
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadPartials();
  highlightActiveNavLink();
  initReviewAnchors();
  initMobileNav();
  initReviewForm();
  initCarousels();
  initFlipbooks();
  initSectionNavigation();
  initFlipbookHeaderVisibility();
  initComingSoonLinks();
  setThemeChoice(DEFAULT_THEME);
});
