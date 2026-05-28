(function () {
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function getQuery() {
    return new URLSearchParams(window.location.search).get("q") || "";
  }

  function render(items) {
    var grid = document.querySelector("[data-search-results]");
    var empty = document.querySelector("[data-search-empty]");
    if (!grid) {
      return;
    }

    grid.innerHTML = items.map(function (item) {
      return [
        "<article class=\"movie-card\">",
        "  <a class=\"poster-link\" href=\"" + escapeHtml(item.link) + "\" aria-label=\"" + escapeHtml(item.title) + "\">",
        "    <span class=\"poster-image\" style=\"background-image: url('" + escapeHtml(item.cover) + "');\"></span>",
        "    <span class=\"poster-shade\"></span>",
        "    <span class=\"poster-play\">▶</span>",
        "    <span class=\"poster-type\">" + escapeHtml(item.type) + "</span>",
        "    <span class=\"poster-year\">" + escapeHtml(item.year) + "</span>",
        "  </a>",
        "  <div class=\"movie-card-body\">",
        "    <h2><a href=\"" + escapeHtml(item.link) + "\">" + escapeHtml(item.title) + "</a></h2>",
        "    <p>" + escapeHtml(item.summary) + "</p>",
        "    <div class=\"card-meta\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.genre) + "</span></div>",
        "  </div>",
        "</article>"
      ].join("\n");
    }).join("\n");

    if (empty) {
      empty.classList.toggle("show", items.length === 0);
    }
  }

  function getKeyword(inputs) {
    var filled = inputs.filter(function (input) {
      return input && input.value.trim();
    });
    return normalize(filled.length ? filled[0].value : (inputs[0] ? inputs[0].value : ""));
  }

  function search() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-global-search]"));
    var type = document.querySelector("[data-global-type]");
    var year = document.querySelector("[data-global-year]");
    var keyword = getKeyword(inputs);
    var typeValue = normalize(type ? type.value : "");
    var yearValue = normalize(year ? year.value : "");
    var sourceItems = typeof SEARCH_ITEMS !== "undefined" ? SEARCH_ITEMS : [];
    var items = sourceItems.filter(function (item) {
      var haystack = normalize([item.title, item.region, item.type, item.year, item.genre, item.tags, item.summary].join(" "));
      var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
      var typeMatch = !typeValue || normalize(item.type).indexOf(typeValue) !== -1;
      var yearMatch = !yearValue || normalize(item.year) === yearValue;
      return keywordMatch && typeMatch && yearMatch;
    }).slice(0, 120);
    render(items);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-global-search]"));
    var type = document.querySelector("[data-global-type]");
    var year = document.querySelector("[data-global-year]");
    var form = document.querySelector("[data-global-search-form]");
    var initialQuery = getQuery();

    if (initialQuery) {
      inputs.forEach(function (input) {
        input.value = initialQuery;
      });
    }

    inputs.concat([type, year]).forEach(function (control) {
      if (control) {
        control.addEventListener("input", search);
        control.addEventListener("change", search);
      }
    });

    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        inputs.forEach(function (otherInput) {
          if (otherInput !== input) {
            otherInput.value = input.value;
          }
        });
      });
    });

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        search();
      });
    }

    search();
  });
})();
