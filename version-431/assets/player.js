(function () {
  var hlsScriptUrl = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
  var hlsPromise = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsPromise) {
      return hlsPromise;
    }
    hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = hlsScriptUrl;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsPromise;
  }

  function playVideo(video) {
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }

  function attachSource(video, source) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      playVideo(video);
      return;
    }
    loadHls().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          playVideo(video);
        });
        video._hlsInstance = hls;
      } else {
        video.src = source;
        playVideo(video);
      }
    }).catch(function () {
      video.src = source;
      playVideo(video);
    });
  }

  function initPlayer(root) {
    var video = root.querySelector("video[data-video-source]");
    var overlay = root.querySelector(".play-overlay");
    if (!video) {
      return;
    }
    var source = video.getAttribute("data-video-source");
    var started = false;
    function start() {
      if (!source) {
        return;
      }
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      if (started) {
        playVideo(video);
        return;
      }
      started = true;
      attachSource(video, source);
    }
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-player]").forEach(initPlayer);
  });
})();
