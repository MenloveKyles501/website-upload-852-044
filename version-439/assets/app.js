(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");

    function updateHeader() {
      if (!header) {
        return;
      }
      header.classList.toggle("is-scrolled", window.scrollY > 18);
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (toggle) {
      toggle.addEventListener("click", function () {
        var opened = document.body.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", opened ? "true" : "false");
      });
    }

    document.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        if (toggle) {
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var currentSlide = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === currentSlide);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === currentSlide);
      });
    }

    function startHero() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        showSlide(index);
        window.clearInterval(timer);
        timer = null;
        startHero();
      });
    });

    showSlide(0);
    startHero();

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector(".movie-filter-input");
      var chips = Array.prototype.slice.call(scope.querySelectorAll(".filter-chip"));
      var grid = scope.nextElementSibling;
      var activeFilter = "all";

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function applyFilter() {
        var query = normalize(input ? input.value : "");
        if (!grid) {
          return;
        }
        grid.querySelectorAll("[data-movie-card]").forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year"),
            card.getAttribute("data-category")
          ].join(" "));
          var matchText = !query || haystack.indexOf(query) !== -1;
          var matchChip = activeFilter === "all" || haystack.indexOf(activeFilter) !== -1;
          card.classList.toggle("hidden", !(matchText && matchChip));
        });
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (item) {
            item.classList.remove("active");
          });
          chip.classList.add("active");
          activeFilter = normalize(chip.getAttribute("data-filter"));
          applyFilter();
        });
      });
    });
  });
})();
