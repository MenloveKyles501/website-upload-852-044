
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
        document.body.classList.toggle('menu-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var previous = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var heroTimer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    }

    function startHero() {
      if (heroTimer || slides.length < 2) {
        return;
      }
      heroTimer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    function resetHero() {
      if (heroTimer) {
        window.clearInterval(heroTimer);
        heroTimer = null;
      }
      startHero();
    }

    if (slides.length) {
      showSlide(0);
      startHero();
    }

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        resetHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        resetHero();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        resetHero();
      });
    });

    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var searchInput = document.querySelector('[data-search-input]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var regionFilter = document.querySelector('[data-region-filter]');
    var yearFilter = document.querySelector('[data-year-filter]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function filterCards() {
      var query = normalize(searchInput ? searchInput.value : '');
      var typeValue = normalize(typeFilter ? typeFilter.value : '');
      var regionValue = normalize(regionFilter ? regionFilter.value : '');
      var yearValue = normalize(yearFilter ? yearFilter.value : '');

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesType = !typeValue || normalize(card.dataset.type).indexOf(typeValue) !== -1;
        var matchesRegion = !regionValue || normalize(card.dataset.region).indexOf(regionValue) !== -1;
        var matchesYear = !yearValue || normalize(card.dataset.year).indexOf(yearValue) !== -1;
        card.classList.toggle('hidden-by-filter', !(matchesQuery && matchesType && matchesRegion && matchesYear));
      });
    }

    [searchInput, typeFilter, regionFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });

    function attachHls(video, stream) {
      if (!video || !stream) {
        return;
      }

      if (video.dataset.ready === '1') {
        return;
      }

      video.dataset.ready = '1';

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video._hlsInstance = hls;
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      video.src = stream;
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (panel) {
      var video = panel.querySelector('video');
      var button = panel.querySelector('[data-play-button]');
      var stream = panel.getAttribute('data-stream');

      function playVideo() {
        attachHls(video, stream);
        if (video) {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
          }
        }
      }

      if (button) {
        button.addEventListener('click', playVideo);
      }

      if (video) {
        video.addEventListener('play', function () {
          panel.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          panel.classList.remove('is-playing');
        });
        video.addEventListener('ended', function () {
          panel.classList.remove('is-playing');
        });
      }
    });
  });
})();
