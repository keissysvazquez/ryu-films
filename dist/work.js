(function () {
  var section = document.querySelector('#work');
  if (!section) return;
  var grid = section.querySelector('.reel-grid');
  var filters = section.querySelector('.reel-filters');
  var dialog = document.querySelector('#reel-dialog');
  var stage = dialog.querySelector('.reel-stage');
  var titleEl = dialog.querySelector('#reel-title');
  var metaEl = dialog.querySelector('.reel-meta-line');
  var linkEl = dialog.querySelector('.reel-link');
  var prevBtn = dialog.querySelector('.reel-prev');
  var nextBtn = dialog.querySelector('.reel-next');

  var videos = (window.RYU_VIDEOS || []).filter(function (v) { return v && v.title; });
  var CATEGORY_ORDER = ['Music Videos', 'Brand Films', 'Behind the Scenes', 'Aerial'];
  var LOAD_TIMEOUT_MS = 15000;
  var reduceMotion = function () {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  var current = 'All';
  var list = [];
  var index = 0;
  var loadTimer = null;
  var lastCard = null;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function safeUrl(u) {
    try {
      var url = new URL(String(u || '').trim());
      return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
    } catch (e) {
      return '';
    }
  }

  // Resolves a data entry to something playable. Swap providers by editing the data only.
  function resolveSource(v) {
    var direct = safeUrl(v.videoUrl);
    if (direct) {
      if (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(direct)) return { type: 'file', url: direct };
      var vm = direct.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
      if (vm) return { type: 'iframe', url: 'https://player.vimeo.com/video/' + vm[1] + '?dnt=1' };
    }
    var ig = safeUrl(v.instagramUrl);
    var m = ig && ig.match(/instagram\.com\/(?:[^/]+\/)?(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i);
    if (m) {
      var kind = m[1].toLowerCase() === 'reels' ? 'reel' : m[1].toLowerCase();
      return { type: 'iframe', url: 'https://www.instagram.com/' + kind + '/' + m[2] + '/embed' };
    }
    return null;
  }

  function metaText(v) {
    return [v.artist, v.category, v.year].filter(Boolean).join(' · ');
  }

  var PLAY_SVG =
    '<svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">' +
    '<circle cx="24" cy="24" r="22.5" fill="rgba(14,10,9,.55)" stroke="currentColor" stroke-width="1.5"/>' +
    '<path d="M19.5 15.5v17l14-8.5z" fill="currentColor"/></svg>';

  function buildCard(v, i) {
    var card = el('button', 'reel-card' + (i === 0 ? ' is-featured' : ''));
    card.type = 'button';
    card.dataset.index = String(i);
    card.setAttribute('aria-label', 'Play ' + v.title + (v.artist ? ' by ' + v.artist : ''));

    var media = el('span', 'reel-media');
    var cover = String(v.coverImage || '').trim();

    function showPlaceholder() {
      media.replaceChildren();
      card.classList.add('no-cover');
      media.append(el('span', 'reel-ph', v.title), playIcon());
    }

    if (cover) {
      var img = document.createElement('img');
      img.src = cover;
      img.alt = '';
      if (v.coverPosition) img.style.objectPosition = v.coverPosition;
      img.loading = i === 0 ? 'eager' : 'lazy';
      img.decoding = 'async';
      img.addEventListener('error', showPlaceholder);
      media.append(img, playIcon());
    } else {
      showPlaceholder();
    }

    var caption = el('span', 'reel-info');
    if (v.artist) caption.append(el('span', 'reel-cat', v.artist));
    caption.append(el('span', 'reel-card-title', v.title));

    card.append(media, caption);
    card.addEventListener('click', function () { openLightbox(i, card); });
    return card;
  }

  function playIcon() {
    var play = el('span', 'reel-play');
    play.innerHTML = PLAY_SVG;
    return play;
  }
  function visible() {
    return current === 'All' ? videos : videos.filter(function (v) { return v.category === current; });
  }

  function renderGrid() {
    list = visible();
    grid.replaceChildren();
    list.forEach(function (v, i) { grid.append(buildCard(v, i)); });
  }

  function renderTabs() {
    var found = [];
    videos.forEach(function (v) { if (v.category && found.indexOf(v.category) < 0) found.push(v.category); });
    var cats = CATEGORY_ORDER.filter(function (c) { return found.indexOf(c) >= 0; })
      .concat(found.filter(function (c) { return CATEGORY_ORDER.indexOf(c) < 0; }));
    filters.replaceChildren();
    ['All'].concat(cats).forEach(function (c) {
      var b = el('button', 'reel-tab' + (c === current ? ' is-active' : ''), c);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(c === current));
      b.addEventListener('click', function () { setFilter(c); });
      filters.append(b);
    });
  }

  function setFilter(c) {
    if (c === current) return;
    current = c;
    filters.querySelectorAll('.reel-tab').forEach(function (b) {
      var on = b.textContent === c;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    if (reduceMotion()) { renderGrid(); return; }
    grid.classList.add('is-switching');
    setTimeout(function () {
      renderGrid();
      grid.classList.remove('is-switching');
    }, 220);
  }

  /* Lightbox */
  function clearStage() {
    clearTimeout(loadTimer);
    stage.replaceChildren();
    stage.classList.remove('is-loading');
  }

  function showFallback(v, message) {
    clearStage();
    var box = el('div', 'reel-fallback');
    box.append(el('p', 'reel-fallback-title', v.title));
    box.append(el('p', 'reel-fallback-text', message));
    var ig = safeUrl(v.instagramUrl);
    if (ig) {
      var a = el('a', 'reel-link', 'View on Instagram');
      a.href = ig;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      box.append(a);
    }
    stage.append(box);
  }

  function loadMedia(v) {
    clearStage();
    var src = resolveSource(v);
    if (!src) {
      showFallback(v, 'This video is not available to play here yet.');
      return;
    }
    stage.classList.add('is-loading');
    var spinner = el('div', 'reel-spinner');
    spinner.setAttribute('role', 'status');
    spinner.setAttribute('aria-label', 'Loading video');
    stage.append(spinner);

    var done = false;
    function ready() {
      if (done) return;
      done = true;
      clearTimeout(loadTimer);
      stage.classList.remove('is-loading');
      spinner.remove();
    }
    function fail() {
      if (done) return;
      done = true;
      showFallback(v, 'This video could not be loaded. It may have been removed or made private.');
    }

    var node;
    if (src.type === 'file') {
      node = document.createElement('video');
      node.controls = true;
      node.playsInline = true;
      node.preload = 'metadata';
      node.setAttribute('aria-label', v.title);
      node.addEventListener('loadeddata', ready);
      node.addEventListener('error', fail);
      node.src = src.url;
    } else {
      node = document.createElement('iframe');
      node.title = v.title;
      node.allowFullscreen = true;
      node.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture');
      node.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      node.addEventListener('load', ready);
      node.addEventListener('error', fail);
      node.src = src.url;
    }
    node.className = 'reel-media-node is-' + src.type;
    stage.append(node);
    loadTimer = setTimeout(fail, LOAD_TIMEOUT_MS);
  }

  function renderLightbox() {
    var v = list[index];
    if (!v) return;
    titleEl.textContent = v.title;
    metaEl.textContent = metaText(v);
    var ig = safeUrl(v.instagramUrl);
    linkEl.hidden = !ig;
    if (ig) linkEl.href = ig;
    var multi = list.length > 1;
    prevBtn.hidden = nextBtn.hidden = !multi;
    loadMedia(v);
  }

  function openLightbox(i, card) {
    index = i;
    lastCard = card || null;
    renderLightbox();
    document.body.classList.add('reel-open');
    if (!dialog.open) dialog.showModal();
    dialog.querySelector('.close').focus();
  }

  function step(delta) {
    if (list.length < 2) return;
    index = (index + delta + list.length) % list.length;
    renderLightbox();
  }

  prevBtn.addEventListener('click', function () { step(-1); });
  nextBtn.addEventListener('click', function () { step(1); });

  dialog.addEventListener('close', function () {
    clearStage();
    document.body.classList.remove('reel-open');
    if (lastCard && document.contains(lastCard)) lastCard.focus();
  });

  dialog.addEventListener('click', function (e) {
    if (!e.target.closest('.reel-content, .reel-nav, .close')) dialog.close();
  });

  dialog.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); dialog.close(); return; }
    if (e.key === 'ArrowLeft') { step(-1); return; }
    if (e.key === 'ArrowRight') { step(1); return; }
    if (e.key !== 'Tab') return;
    var items = Array.prototype.filter.call(
      dialog.querySelectorAll('button, a[href], iframe, video[controls]'),
      function (n) { return !n.hidden && !n.closest('[hidden]'); }
    );
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    var active = document.activeElement;
    if (e.shiftKey && (active === first || !dialog.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || !dialog.contains(active))) {
      e.preventDefault();
      first.focus();
    }
  });

  if (!videos.length) {
    section.hidden = true;
    document.querySelectorAll('a[href="#work"]').forEach(function (a) { a.hidden = true; });
    return;
  }
  renderTabs();
  renderGrid();
})();
