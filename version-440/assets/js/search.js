(function () {
  function $(selector) {
    return document.querySelector(selector);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function movieCard(movie) {
    var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.categoryName, movie.oneLine].join(' ');
    return [
      '<article class="movie-card" data-movie-card data-search="', escapeHtml(text), '" data-title="', escapeHtml(movie.title), '" data-region="', escapeHtml(movie.region), '" data-type="', escapeHtml(movie.type), '" data-year="', escapeHtml(movie.year), '" data-genre="', escapeHtml(movie.genre), '" data-category="', escapeHtml(movie.category), '">',
      '  <a href="movies/movie-', escapeHtml(movie.id), '.html" class="card-link" aria-label="观看 ', escapeHtml(movie.title), '">',
      '    <div class="card-cover">',
      '      <img class="poster-img" src="./', escapeHtml(movie.cover), '.jpg" alt="', escapeHtml(movie.title), '" loading="lazy">',
      '      <span class="play-badge" aria-hidden="true">▶</span>',
      '      <span class="card-meta-badge">', escapeHtml(movie.year), '</span>',
      '    </div>',
      '    <div class="card-body">',
      '      <h3>', escapeHtml(movie.title), '</h3>',
      '      <p>', escapeHtml(movie.oneLine), '</p>',
      '      <div class="card-foot">',
      '        <span>', escapeHtml(movie.categoryName), '</span>',
      '        <span>', escapeHtml(movie.type), '</span>',
      '      </div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function setupImageFallbacks(root) {
    Array.prototype.slice.call((root || document).querySelectorAll('img')).forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
        if (image.parentElement) {
          image.parentElement.classList.add('cover-fallback');
        }
      });
    });
  }

  function render() {
    var data = window.MOVIE_DATA || [];
    var results = $('[data-search-results]');
    var summary = $('[data-search-summary]');
    var pageInput = $('[data-search-page-input]');
    var keywordInput = $('[data-filter-keyword]');
    var typeSelect = $('[data-filter-type]');
    var yearSelect = $('[data-filter-year]');
    var categorySelect = $('[data-filter-category]');

    if (!results) {
      return;
    }

    var initialQuery = getQueryValue('q');
    if (pageInput) {
      pageInput.value = initialQuery;
    }
    if (keywordInput) {
      keywordInput.value = initialQuery;
    }

    function apply() {
      var query = normalize(keywordInput && keywordInput.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var category = normalize(categorySelect && categorySelect.value);
      var matched = data.filter(function (movie) {
        var text = normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.categoryName, movie.oneLine].join(' '));
        if (query && text.indexOf(query) === -1) {
          return false;
        }
        if (type && normalize(movie.type) !== type) {
          return false;
        }
        if (year && normalize(movie.year) !== year) {
          return false;
        }
        if (category && normalize(movie.category) !== category) {
          return false;
        }
        return true;
      });

      results.innerHTML = matched.map(movieCard).join('');
      setupImageFallbacks(results);

      if (summary) {
        summary.textContent = matched.length ? '已为你找到匹配的视频内容。' : '暂无匹配内容，请调整关键词或筛选条件。';
      }
    }

    [keywordInput, typeSelect, yearSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    var form = $('[data-search-page-form]');
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (keywordInput && pageInput) {
          keywordInput.value = pageInput.value;
        }
        apply();
      });
    }

    apply();
  }

  document.addEventListener('DOMContentLoaded', render);
})();
