(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var next = hero.querySelector("[data-hero-next]");
        var prev = hero.querySelector("[data-hero-prev]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
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
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initSearch() {
        var input = document.querySelector("[data-search-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var filters = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        if (!input || cards.length === 0) {
            return;
        }
        var activeFilter = "all";

        function apply() {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var title = (card.getAttribute("data-title") || "").toLowerCase();
                var meta = (card.getAttribute("data-meta") || "").toLowerCase();
                var matchedKeyword = !keyword || title.indexOf(keyword) !== -1 || meta.indexOf(keyword) !== -1;
                var matchedFilter = activeFilter === "all" || meta.indexOf(activeFilter.toLowerCase()) !== -1;
                card.classList.toggle("is-filtered-out", !(matchedKeyword && matchedFilter));
            });
        }

        input.addEventListener("input", apply);
        filters.forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = button.getAttribute("data-filter-value") || "all";
                filters.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                apply();
            });
        });
    }

    function initLoadMore() {
        var button = document.querySelector("[data-load-more]");
        if (!button) {
            return;
        }
        var step = 48;
        button.addEventListener("click", function () {
            var hidden = Array.prototype.slice.call(document.querySelectorAll(".is-extra:not(.is-visible)"));
            hidden.slice(0, step).forEach(function (card) {
                card.classList.add("is-visible");
            });
            if (document.querySelectorAll(".is-extra:not(.is-visible)").length === 0) {
                button.style.display = "none";
            }
        });
    }

    window.initMoviePlayer = function (source) {
        var video = document.querySelector("[data-video]");
        var overlay = document.querySelector("[data-player-overlay]");
        if (!video || !source) {
            return;
        }
        var hlsInstance = null;
        var prepared = false;

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            prepare();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        initNavigation();
        initHero();
        initSearch();
        initLoadMore();
    });
})();
