(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      if (!value) {
        event.preventDefault();
        window.location.href = './search.html';
      }
    });
  });

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === activeIndex);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === activeIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    var pageSearch = filterPanel.querySelector('[data-page-search]');
    var regionSelect = filterPanel.querySelector('[data-filter-region]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var genreSelect = filterPanel.querySelector('[data-filter-genre]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (pageSearch && initialQuery) {
      pageSearch.value = initialQuery;
    }

    function includesText(text, query) {
      return String(text || '').toLowerCase().indexOf(query) !== -1;
    }

    function filterCards() {
      var query = pageSearch ? pageSearch.value.trim().toLowerCase() : '';
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var genre = genreSelect ? genreSelect.value : '';

      cards.forEach(function (card) {
        var text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.type,
          card.textContent
        ].join(' ').toLowerCase();
        var matched = true;

        if (query && !includesText(text, query)) {
          matched = false;
        }
        if (region && card.dataset.region !== region) {
          matched = false;
        }
        if (year && card.dataset.year !== year) {
          matched = false;
        }
        if (genre && !includesText(card.dataset.genre, genre)) {
          matched = false;
        }

        card.classList.toggle('hidden', !matched);
      });
    }

    [pageSearch, regionSelect, yearSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });

    filterCards();
  }

  var player = document.querySelector('[data-player]');
  if (player) {
    var video = player.querySelector('video');
    var playButton = player.querySelector('[data-play]');
    var videoUrl = player.getAttribute('data-video');
    var hlsInstance = null;
    var preparing = null;

    function getHls() {
      if (window.Hls) {
        return Promise.resolve(window.Hls);
      }
      return Promise.resolve(null);
    }

    function prepareVideo() {
      if (!video || !videoUrl) {
        return Promise.resolve();
      }
      if (video.dataset.ready === '1') {
        return Promise.resolve();
      }
      if (preparing) {
        return preparing;
      }
      preparing = getHls().then(function (HlsClass) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = videoUrl;
        } else if (HlsClass && HlsClass.isSupported && HlsClass.isSupported()) {
          hlsInstance = new HlsClass({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(videoUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = videoUrl;
        }
        video.dataset.ready = '1';
      });
      return preparing;
    }

    function startVideo() {
      prepareVideo().then(function () {
        player.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      });
    }

    if (playButton) {
      playButton.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          player.classList.remove('is-playing');
        }
      });
      prepareVideo();
    }
  }
})();
