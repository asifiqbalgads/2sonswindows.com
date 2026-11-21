/* ==========================================================================
   2 Sons Window Cleaning & Power Washing — interactions
   Vanilla JS, no dependencies. Progressive enhancement only.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: solid on scroll ---------- */
  var header = document.getElementById('siteHeader');
  var lastY = window.scrollY;

  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-stuck', y > 24);
    lastY = y;
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile navigation ---------- */
  var menuToggle = document.getElementById('menuToggle');
  var nav = document.getElementById('primaryNav');
  var navClose = document.getElementById('navClose');

  function setNav(open) {
    if (!nav || !menuToggle) return;
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      setNav(!nav.classList.contains('is-open'));
    });
  }
  if (navClose) {
    navClose.addEventListener('click', function () {
      setNav(false);
    });
  }
  if (nav) {
    nav.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (link) setNav(false);
      else if (e.target === nav) setNav(false);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setNav(false);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1024) setNav(false);
  });

  /* ---------- Service list: cursor-following preview ---------- */
  var servicesWrap = document.querySelector('.services');
  var preview = document.getElementById('servicePreview');
  var previewImg = preview ? preview.querySelector('img') : null;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var activeService = null;

  function showPreview(service, x, y) {
    if (!preview || !previewImg || !servicesWrap) return;
    var src = service.getAttribute('data-img');
    if (src && previewImg.getAttribute('src') !== src) previewImg.setAttribute('src', src);
    servicesWrap.classList.add('is-hovering');
    preview.classList.add('is-on');
    preview.style.left = x + 'px';
    preview.style.top = y + 'px';
  }
  function hidePreview() {
    if (!preview || !servicesWrap) return;
    servicesWrap.classList.remove('is-hovering');
    preview.classList.remove('is-on');
  }

  if (servicesWrap && finePointer) {
    servicesWrap.addEventListener('pointermove', function (e) {
      var service = e.target.closest('.service');
      if (!service) { hidePreview(); activeService = null; return; }
      activeService = service;
      showPreview(service, e.clientX, e.clientY);
    });
    servicesWrap.addEventListener('pointerleave', hidePreview);
    servicesWrap.addEventListener('focusin', function (e) {
      var service = e.target.closest('.service');
      if (!service) return;
      var r = service.getBoundingClientRect();
      showPreview(service, Math.min(window.innerWidth - 140, r.right - 120), r.top + r.height / 2);
    });
    servicesWrap.addEventListener('focusout', hidePreview);
  }

  /* ---------- Gallery filters ---------- */
  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var tiles = Array.prototype.slice.call(document.querySelectorAll('#gallery .tile'));
  var galleryEmpty = document.getElementById('galleryEmpty');

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = btn.getAttribute('data-filter');
      filters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      var shown = 0;
      tiles.forEach(function (tile) {
        var match = cat === 'all' || tile.getAttribute('data-cat') === cat;
        tile.classList.toggle('is-hidden', !match);
        if (match) shown++;
      });
      if (galleryEmpty) galleryEmpty.hidden = shown !== 0;
    });
  });

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCaption = document.getElementById('lbCaption');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var visibleTiles = [];
  var lbIndex = 0;
  var lastFocus = null;

  function visibleList() {
    return tiles.filter(function (t) { return !t.classList.contains('is-hidden'); });
  }
  function openLightbox(tile) {
    if (!lightbox || !lbImg) return;
    visibleTiles = visibleList();
    lbIndex = visibleTiles.indexOf(tile);
    renderLightbox();
    lastFocus = document.activeElement;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    if (lbClose) lbClose.focus();
  }
  function renderLightbox() {
    var tile = visibleTiles[lbIndex];
    if (!tile || !lbImg) return;
    var img = tile.querySelector('img');
    lbImg.src = tile.getAttribute('data-full') || (img ? img.currentSrc || img.src : '');
    lbImg.alt = img ? img.alt : '';
    if (lbCaption) lbCaption.textContent = tile.getAttribute('data-caption') || '';
    var multiple = visibleTiles.length > 1;
    if (lbPrev) lbPrev.style.display = multiple ? '' : 'none';
    if (lbNext) lbNext.style.display = multiple ? '' : 'none';
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  function stepLightbox(dir) {
    if (!visibleTiles.length) return;
    lbIndex = (lbIndex + dir + visibleTiles.length) % visibleTiles.length;
    renderLightbox();
  }

  tiles.forEach(function (tile) {
    tile.addEventListener('click', function () { openLightbox(tile); });
  });
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', function () { stepLightbox(-1); });
  if (lbNext) lbNext.addEventListener('click', function () { stepLightbox(1); });
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') stepLightbox(-1);
      if (e.key === 'ArrowRight') stepLightbox(1);
      if (e.key === 'Tab') {
        var focusables = lightbox.querySelectorAll('button');
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Reviews carousel ---------- */
  var track = document.getElementById('reviewsTrack');
  var revPrev = document.getElementById('revPrev');
  var revNext = document.getElementById('revNext');

  function cardStep() {
    if (!track) return 300;
    var card = track.querySelector('.review-card');
    return card ? card.getBoundingClientRect().width + 18 : 300;
  }
  function syncArrows() {
    if (!track || !revPrev || !revNext) return;
    var max = track.scrollWidth - track.clientWidth - 2;
    revPrev.disabled = track.scrollLeft <= 2;
    revNext.disabled = track.scrollLeft >= max;
  }
  if (track) {
    if (revPrev) revPrev.addEventListener('click', function () {
      track.scrollBy({ left: -cardStep(), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    if (revNext) revNext.addEventListener('click', function () {
      track.scrollBy({ left: cardStep(), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    track.addEventListener('scroll', syncArrows, { passive: true });
    window.addEventListener('resize', syncArrows);
    syncArrows();
  }

  /* ---------- Review "read more" ---------- */
  var reviewTexts = Array.prototype.slice.call(document.querySelectorAll('.review-text'));
  reviewTexts.forEach(function (text) {
    var btn = text.parentElement.querySelector('.review-more');
    if (!btn) return;
    var overflowing = text.scrollHeight - text.clientHeight > 4;
    if (!overflowing) { btn.hidden = true; return; }
    btn.hidden = false;
    btn.addEventListener('click', function () {
      var clamped = text.classList.toggle('is-clamped');
      btn.textContent = clamped ? 'Read more' : 'Show less';
      if (clamped) {
        var top = text.getBoundingClientRect().top;
        if (top < 0) text.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
      }
      setTimeout(syncArrows, 350);
    });
  });

  /* ---------- FAQ accordion ---------- */
  var faqButtons = Array.prototype.slice.call(document.querySelectorAll('.faq-q'));
  faqButtons.forEach(function (btn) {
    var panel = btn.nextElementSibling;
    if (!panel) return;
    btn.addEventListener('click', function () {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      faqButtons.forEach(function (other) {
        if (other === btn) return;
        if (other.getAttribute('aria-expanded') === 'true') {
          other.setAttribute('aria-expanded', 'false');
          other.nextElementSibling.style.height = '0px';
        }
      });
      btn.setAttribute('aria-expanded', String(!isOpen));
      panel.style.height = isOpen ? '0px' : panel.scrollHeight + 'px';
    });
  });
  window.addEventListener('resize', function () {
    faqButtons.forEach(function (btn) {
      if (btn.getAttribute('aria-expanded') === 'true' && btn.nextElementSibling) {
        btn.nextElementSibling.style.height = btn.nextElementSibling.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Scroll reveal ---------- */
  var revealTargets = [
    '.hero-copy', '.hero-panes', '.intro-media', '.intro-copy',
    '.section-head', '.service', '.ba-card', '.filter', '.tile',
    '.step', '.offer', '.reviews-header', '.review-card',
    '.county', '.towns', '.faq-item', '.cta-copy', '.cta-cards', '.stat'
  ];
  var items = [];
  revealTargets.forEach(function (sel) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
      if (!el.hasAttribute('data-reveal')) { el.setAttribute('data-reveal', ''); items.push(el); }
    });
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = Math.min(items.indexOf(el) % 6, 5) * 60;
          el.style.transitionDelay = delay + 'ms';
          el.classList.add('is-in');
          io.unobserve(el);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Smooth scroll fallback for older browsers ---------- */
  if (!('scrollBehavior' in document.documentElement.style)) {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id === '#') return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - 84);
      });
    });
  }
})();
