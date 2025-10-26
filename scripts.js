// scripts.js
// Minimal, dependency-free behaviour for smooth TOC scrolling, download-link handling,
// and a small scrollspy to highlight the current TOC item.
// Save this file as UTF-8 and keep it next to index.html.

(function () {
  'use strict';

  // Helpers
  var qs = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var qsa = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  // Smooth scroll for TOC links
  function initSmoothScroll() {
    var links = qsa('nav.toc a[href^="#"]');
    links.forEach(function (link) {
      link.addEventListener('click', function (ev) {
        ev.preventDefault();
        var id = link.getAttribute('href').slice(1);
        var target = document.getElementById(id);
        if (!target) return;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // update URL without adding a new history entry
        try { history.replaceState(null, '', '#' + id); } catch (e) {}
      });
    });
  }

  // Make sure certain download links open safely and try to trigger navigation as a fallback
  function initDownloadLinks() {
    var downloads = qsa('a[href*="uc?export=download"], a[href$=".pdf"]');
    downloads.forEach(function (a) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      // Optional: set download attribute only for same-origin files (won't work cross-origin)
      try {
        var sameOrigin = new URL(a.href, location.href).origin === location.origin;
        if (sameOrigin && a.href.match(/\.pdf$/i)) a.setAttribute('download', '');
      } catch (e) {}
      // Click fallback (helps some browsers)
      a.addEventListener('click', function () {
        try { window.location.href = a.href; } catch (e) {}
      });
    });
  }

  // Scrollspy: highlight the active TOC link using IntersectionObserver
  function initScrollSpy() {
    var sections = qsa('main article section[id]');
    if (!('IntersectionObserver' in window) || !sections.length) return;

    var tocLinks = qsa('nav.toc a[href^="#"]');
    var idToLink = {};
    tocLinks.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      idToLink[id] = link;
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var id = entry.target.id;
        var link = idToLink[id];
        if (!link) return;
        if (entry.isIntersecting) {
          // add active class
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }, { root: null, rootMargin: '-30% 0px -60% 0px', threshold: 0 });

    sections.forEach(function (sec) { observer.observe(sec); });
  }

  // Initialize everything when DOM is ready
  function init() {
    initSmoothScroll();
    initDownloadLinks();
    initScrollSpy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
