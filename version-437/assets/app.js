(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupMenu() {
        var toggle = qs('[data-menu-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('.hero-slide', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function currentQuery() {
        var params = new URLSearchParams(window.location.search);
        return normalize(params.get('q'));
    }

    function applyFilter(term) {
        var cards = qsa('.movie-card');
        var countBox = qs('[data-filter-count]');
        var matched = 0;
        var query = normalize(term);
        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search'));
            var visible = !query || text.indexOf(query) !== -1;
            card.classList.toggle('is-hidden', !visible);
            if (visible) {
                matched += 1;
            }
        });
        if (countBox) {
            countBox.textContent = matched + ' 部影片';
        }
    }

    function setupSearch() {
        var query = currentQuery();
        qsa('input[type="search"][name="q"]').forEach(function (input) {
            if (query) {
                input.value = query;
            }
        });
        if (query && qs('[data-card-list]')) {
            applyFilter(query);
        }
        qsa('[data-local-filter]').forEach(function (form) {
            var input = qs('input[type="search"]', form);
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                applyFilter(input ? input.value : '');
            });
            if (input) {
                input.addEventListener('input', function () {
                    applyFilter(input.value);
                });
            }
        });
    }

    function setupPlayer() {
        var video = qs('#movie-player');
        var overlay = qs('[data-player-start]');
        var config = window.moviePlayerConfig;
        if (!video || !config || !config.source) {
            return;
        }
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = config.source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(config.source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = config.source;
            }
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (!attached || video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupPlayer();
    });
})();
