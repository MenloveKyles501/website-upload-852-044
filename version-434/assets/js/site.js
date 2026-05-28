(function () {
  var ready = function (fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  };

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-missing");
      });
    });

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var active = 0;
      var timer;

      var show = function (index) {
        if (!slides.length) {
          return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === active);
        });
      };

      var start = function () {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5200);
      };

      if (prev) {
        prev.addEventListener("click", function () {
          show(active - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(active + 1);
          start();
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });

      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-list]").forEach(function (list) {
      var section = list.closest("section") || document;
      var input = section.querySelector("[data-filter-input]") || document.querySelector("[data-filter-input]");
      var select = section.querySelector("[data-filter-select]") || document.querySelector("[data-filter-select]");
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));

      var apply = function () {
        var q = input ? input.value.trim().toLowerCase() : "";
        var type = select ? select.value.trim().toLowerCase() : "";

        cards.forEach(function (card) {
          var haystack = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
          var matchedText = !q || haystack.indexOf(q) !== -1;
          var matchedType = !type || haystack.indexOf(type) !== -1;
          card.classList.toggle("is-hidden", !(matchedText && matchedType));
        });
      };

      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", apply);
      }
      apply();
    });

    document.querySelectorAll("[data-player]").forEach(function (wrap) {
      var video = wrap.querySelector("[data-video]");
      var button = wrap.querySelector("[data-play]");
      var source = wrap.getAttribute("data-src");
      var hlsInstance = null;

      var mount = function () {
        if (!video || !source) {
          return;
        }

        if (button) {
          button.classList.add("is-hidden");
        }

        if (video.getAttribute("data-ready") === "1") {
          video.play().catch(function () {});
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.setAttribute("data-ready", "1");
            video.play().catch(function () {});
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hlsInstance) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              } else {
                hlsInstance.destroy();
                hlsInstance = null;
              }
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.setAttribute("data-ready", "1");
          video.play().catch(function () {});
        } else {
          video.src = source;
          video.setAttribute("data-ready", "1");
          video.play().catch(function () {});
        }
      };

      if (button) {
        button.addEventListener("click", mount);
      }

      wrap.addEventListener("click", function (event) {
        if (event.target === video && video.getAttribute("data-ready") !== "1") {
          mount();
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
