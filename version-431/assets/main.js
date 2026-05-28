(function () {
  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initActiveLinks() {
    var current = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-link, .mobile-link").forEach(function (link) {
      var href = link.getAttribute("href") || "";
      var target = href.replace("./", "");
      if (target === current || (current.indexOf("movie-") === 0 && target === "videos-1.html")) {
        link.classList.add("is-active");
      }
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    restart();
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var container = panel.parentElement;
      var input = panel.querySelector("[data-filter-search]");
      var type = panel.querySelector("[data-filter-type]");
      var region = panel.querySelector("[data-filter-region]");
      var genre = panel.querySelector("[data-filter-genre]");
      var cards = Array.prototype.slice.call(container.querySelectorAll("[data-card]"));
      function apply() {
        var query = normalize(input && input.value);
        var typeValue = normalize(type && type.value);
        var regionValue = normalize(region && region.value);
        var genreValue = normalize(genre && genre.value);
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var cardGenre = normalize(card.getAttribute("data-genre"));
          var ok = true;
          if (query && text.indexOf(query) === -1) {
            ok = false;
          }
          if (typeValue && cardType !== typeValue) {
            ok = false;
          }
          if (regionValue && cardRegion !== regionValue) {
            ok = false;
          }
          if (genreValue && cardGenre.indexOf(genreValue) === -1) {
            ok = false;
          }
          card.classList.toggle("is-hidden", !ok);
        });
      }
      [input, type, region, genre].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      var params = new URLSearchParams(location.search);
      var q = params.get("q");
      if (q && input) {
        input.value = q;
      }
      apply();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initActiveLinks();
    initHero();
    initFilters();
  });
})();
