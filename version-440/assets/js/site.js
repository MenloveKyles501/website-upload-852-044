(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMobileMenu() {
    var toggle = $('[data-menu-toggle]');
    var panel = $('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      toggle.setAttribute('aria-label', panel.classList.contains('is-open') ? '关闭移动导航' : '打开移动导航');
    });
  }

  function setupSearchForms() {
    $all('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });
  }

  function setupHeroCarousel() {
    var carousel = $('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = $all('[data-hero-slide]', carousel);
    var dots = $all('[data-hero-dot]', carousel);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5500);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    $all('[data-filter-scope]').forEach(function (scope) {
      var keyword = $('[data-filter-keyword]', scope) || $('[data-filter-keyword]', document);
      var type = $('[data-filter-type]', scope) || $('[data-filter-type]', document);
      var year = $('[data-filter-year]', scope) || $('[data-filter-year]', document);
      var category = $('[data-filter-category]', scope) || $('[data-filter-category]', document);
      var empty = $('[data-filter-empty]', scope) || $('[data-filter-empty]', document);
      var cards = $all('[data-movie-card]', scope);

      function apply() {
        var query = normalize(keyword && keyword.value);
        var typeValue = normalize(type && type.value);
        var yearValue = normalize(year && year.value);
        var categoryValue = normalize(category && category.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardCategory = normalize(card.getAttribute('data-category'));
          var matched = true;

          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (typeValue && cardType !== typeValue) {
            matched = false;
          }
          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }
          if (categoryValue && cardCategory !== categoryValue) {
            matched = false;
          }

          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [keyword, type, year, category].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  function setupImageFallbacks() {
    $all('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
        if (image.parentElement) {
          image.parentElement.classList.add('cover-fallback');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupSearchForms();
    setupHeroCarousel();
    setupFilters();
    setupImageFallbacks();
  });
})();
