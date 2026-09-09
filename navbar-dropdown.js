/* ═══════════════════════════════════════════════════════════════════════════
   Mapping Memory, Mapping Meals — Dropdown Nav JS  v5  (FINAL FIX)
   File: navbar-dropdown.js
   ═══════════════════════════════════════════════════════════════════════════
   ROOT CAUSE OF ALL PREVIOUS FAILURES:
   The mobile nav uses short labels ("Media", "Coverage", "Credits", "Cite")
   while the desktop nav uses long labels ("Media Section", "Media Coverage",
   "Other Credits", "Cite This Project"). Previous versions searched for
   one but the page had the other. v5 searches for BOTH simultaneously,
   tries <a> and <button> BEFORE <li>, and clicks child elements too.
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* Each entry = array of ALL possible text strings for that section,
     covering both the desktop nav (long) and mobile nav (short).
     Order: most specific first.                                             */
  var TEXTS = {
    'home':           ['Home'],
    'about':          ['About'],
    'archive-map':    ['Archive Map'],
    'media':          ['Media Section', 'Media'],
    'recipe-videos':  ['154 Recipe Videos', 'Recipe Videos'],
    'coverage':       ['Media Coverage', 'Coverage'],
    'academia':       ['Global Academia', 'Academia'],
    'team':           ['Our Team', 'Team'],
    'special-credit': ['Special Credit'],
    'credits':        ['Other Credits', 'Credits'],
    'acknowledgement':['Acknowledgement'],
    'submissions':    ['Submissions'],
    'review':         ['Contribute a Review', 'Review'],
    'blog-submit':    ['Submit a Blog', 'Blog Submit'],
    'edit-data':      ['Edit Data'],
    'bibliography':   ['Bibliography'],
    'blogs':          ['Blogs'],
    'interviews':     ['Interviews'],
    'sustainability': ['Sustainability'],
    'license':        ['License & Ethics', 'License'],
    'faq':            ['FAQ'],
    'feedback':       ['Feedback'],
    'contact':        ['Contact'],
    'cite':           ['Cite This Project', 'Cite']
  };

  /* Returns true if the element's trimmed text matches any of the patterns. */
  function matches(el, patterns) {
    var raw = el.textContent || '';
    var txt = raw.trim().replace(/\s+/g, ' ');
    if (txt.length > 100) return false;       /* skip paragraphs */
    return patterns.some(function (p) {
      return txt === p ||                     /* exact */
             txt.endsWith(p) ||              /* emoji prefix: "🗺 Archive Map" ends with "Archive Map" */
             txt.endsWith(' ' + p) ||        /* space before */
             (p.length >= 8 && txt.indexOf(p) !== -1); /* long pattern substring */
    });
  }

  /* Core navigation function.
     Tries <a>/<button> before <li>, skips our nav and footer,
     clicks both the found element AND any clickable children.              */
  function doNavigate(target) {
    var patterns = TEXTS[target];
    if (!patterns || patterns.length === 0) return;

    /* Pass 1 — <a> and <button> (most likely to have JS click handlers) */
    var pass1 = document.querySelectorAll('a, button');
    for (var i = 0; i < pass1.length; i++) {
      var el = pass1[i];
      if (el.closest('#mmmm-dropdown-nav')) continue;
      if (el.closest('footer'))             continue;
      if (matches(el, patterns)) {
        el.click();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    /* Pass 2 — <li> items (mobile nav) */
    var pass2 = document.querySelectorAll('li');
    for (var j = 0; j < pass2.length; j++) {
      var li = pass2[j];
      if (li.closest('#mmmm-dropdown-nav')) continue;
      if (li.closest('footer'))             continue;
      if (matches(li, patterns)) {
        /* Click the <li> itself */
        li.click();
        /* Also click any <a> or <button> child — handles nested anchors */
        var children = li.querySelectorAll('a, button');
        for (var k = 0; k < children.length; k++) {
          children[k].click();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    /* Pass 3 — any other element anywhere on the page */
    var pass3 = document.querySelectorAll('span, div, p');
    for (var m = 0; m < pass3.length; m++) {
      var sp = pass3[m];
      if (sp.closest('#mmmm-dropdown-nav')) continue;
      if (sp.closest('footer'))             continue;
      if (matches(sp, patterns)) {
        sp.click();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    /* Pass 4 — hash-based fallback */
    window.location.hash = target;
    window.dispatchEvent(new Event('hashchange'));
    var byId = document.getElementById(target);
    if (byId) byId.scrollIntoView({ behavior: 'smooth' });
  }

  /* ════════════════════════════════════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', function () {

    var nav    = document.getElementById('mmmm-dropdown-nav');
    var burger = document.getElementById('dd-burger');
    var menu   = document.getElementById('dd-menu');
    if (!nav) return;

    /* ── Hamburger ────────────────────────────────────────────────────── */
    if (burger && menu) {
      burger.addEventListener('click', function (e) {
        e.stopPropagation();
        var o = menu.classList.toggle('open');
        burger.classList.toggle('open', o);
        burger.setAttribute('aria-expanded', o);
      });
    }

    /* ── Dropdown toggles ─────────────────────────────────────────────── */
    nav.querySelectorAll('.dd-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var item    = btn.closest('.dd-item');
        var wasOpen = item.classList.contains('open');
        closeAll();
        if (!wasOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    /* ── Section navigation ───────────────────────────────────────────── */
    nav.querySelectorAll('[data-section]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeAll();
        closeMobile();
        doNavigate(el.dataset.section);
      });
    });

    /* ── Brand → Home ─────────────────────────────────────────────────── */
    var brand = nav.querySelector('.dd-brand');
    if (brand) {
      brand.addEventListener('click', function (e) {
        e.preventDefault();
        closeAll(); closeMobile();
        doNavigate('home');
      });
    }

    /* ── Outside click closes dropdowns ───────────────────────────────── */
    document.addEventListener('click', function () { closeAll(); closeMobile(); });
    nav.querySelectorAll('.dd-panel').forEach(function (p) {
      p.addEventListener('click', function (e) { e.stopPropagation(); });
    });

    /* ── Escape key ───────────────────────────────────────────────────── */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeAll(); closeMobile(); }
    });

    /* ── Sticky shadow ────────────────────────────────────────────────── */
    window.addEventListener('scroll', function () {
      nav.style.boxShadow = window.scrollY > 6
        ? '0 4px 28px rgba(0,0,0,.8)' : '0 2px 18px rgba(0,0,0,.65)';
    }, { passive: true });

    /* ── helpers ──────────────────────────────────────────────────────── */
    function closeAll() {
      nav.querySelectorAll('.dd-item.open').forEach(function (i) {
        i.classList.remove('open');
        var b = i.querySelector('.dd-btn');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
    }
    function closeMobile() {
      if (menu) menu.classList.remove('open');
      if (burger) {
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    }
  });

})();
