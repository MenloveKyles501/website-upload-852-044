(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    function startHero() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5600);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        startHero();
      });
    });

    showSlide(0);
    startHero();

    var filterInput = document.querySelector("[data-filter-input]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
      if (!cards.length) {
        return;
      }

      var keyword = normalize(filterInput ? filterInput.value : "");
      var typeValue = normalize(typeSelect ? typeSelect.value : "");
      var yearValue = normalize(yearSelect ? yearSelect.value : "");

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre")
        ].join(" "));
        var typeMatch = !typeValue || normalize(card.getAttribute("data-type")).indexOf(typeValue) !== -1;
        var yearMatch = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
        var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle("hidden", !(typeMatch && yearMatch && keywordMatch));
      });
    }

    [filterInput, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play]");
      var stream = player.getAttribute("data-stream");
      var prepared = false;
      var hlsInstance = null;

      function prepareVideo() {
        if (prepared || !video || !stream) {
          return;
        }

        prepared = true;

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 32,
            enableWorker: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function startVideo() {
        prepareVideo();
        player.classList.add("is-active");
        if (video) {
          var playResult = video.play();
          if (playResult && typeof playResult.catch === "function") {
            playResult.catch(function () {});
          }
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          startVideo();
        });
      }

      player.addEventListener("click", function (event) {
        if (event.target === video || event.target.closest("[data-play]") || event.target.closest("video")) {
          return;
        }
        startVideo();
      });

      if (video) {
        video.addEventListener("play", function () {
          player.classList.add("is-active");
        });
        video.addEventListener("error", function () {
          player.classList.remove("is-active");
        });
      }
    });
  });
})();
