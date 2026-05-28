(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var shell = document.querySelector('[data-player]');
    if (!shell) {
      return;
    }

    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-overlay');
    var status = shell.querySelector('.player-status');
    var source = shell.getAttribute('data-video-url') || '';
    var hls = null;
    var initialized = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message || '';
      }
    }

    function bindSource() {
      if (!video || !source) {
        setStatus('当前播放源暂不可用。');
        return false;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return true;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已就绪。');
        });

        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus('播放网络暂时不可用，正在尝试恢复。');
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus('媒体加载异常，正在尝试恢复。');
            hls.recoverMediaError();
          } else {
            setStatus('播放源加载失败，请稍后重试。');
            hls.destroy();
          }
        });

        return true;
      }

      setStatus('当前浏览器不支持 HLS 播放。');
      return false;
    }

    function playVideo() {
      if (!initialized) {
        initialized = bindSource();
      }

      if (!initialized || !video) {
        return;
      }

      shell.classList.add('is-playing');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          shell.classList.remove('is-playing');
          setStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
        setStatus('');
      });

      video.addEventListener('pause', function () {
        if (!video.ended) {
          shell.classList.remove('is-playing');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
