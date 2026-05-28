(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      const open = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
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
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    const root = panel.closest('section') || document;
    const list = root.querySelector('[data-filter-list]');
    const empty = root.querySelector('[data-empty-state]');
    const input = panel.querySelector('[data-filter-input]');
    const yearSelect = panel.querySelector('[data-filter-year]');
    const regionSelect = panel.querySelector('[data-filter-region]');
    const reset = panel.querySelector('[data-filter-reset]');

    if (!list || !input || !yearSelect || !regionSelect) {
      return;
    }

    const items = Array.from(list.children);
    const years = new Set();
    const regions = new Set();

    items.forEach(function (item) {
      if (item.dataset.year) {
        years.add(item.dataset.year);
      }
      if (item.dataset.region) {
        regions.add(item.dataset.region);
      }
    });

    Array.from(years).sort().reverse().forEach(function (year) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    });

    Array.from(regions).sort().forEach(function (region) {
      const option = document.createElement('option');
      option.value = region;
      option.textContent = region;
      regionSelect.appendChild(option);
    });

    const url = new URL(window.location.href);
    const initialQuery = url.searchParams.get('q');
    if (initialQuery) {
      input.value = initialQuery;
    }

    function apply() {
      const keyword = input.value.trim().toLowerCase();
      const year = yearSelect.value;
      const region = regionSelect.value;
      let visible = 0;

      items.forEach(function (item) {
        const text = (item.dataset.search || item.textContent || '').toLowerCase();
        const matchKeyword = !keyword || text.includes(keyword);
        const matchYear = !year || item.dataset.year === year;
        const matchRegion = !region || item.dataset.region === region;
        const showItem = matchKeyword && matchYear && matchRegion;
        item.classList.toggle('is-filtered-out', !showItem);
        if (showItem) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    input.addEventListener('input', apply);
    yearSelect.addEventListener('change', apply);
    regionSelect.addEventListener('change', apply);

    if (reset) {
      reset.addEventListener('click', function () {
        input.value = '';
        yearSelect.value = '';
        regionSelect.value = '';
        apply();
      });
    }

    apply();
  });
})();
