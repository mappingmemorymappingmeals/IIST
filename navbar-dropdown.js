/* ═══════════════════════════════════════════════════════════════════════════
   Mapping Memory, Mapping Meals — Complete Dropdown Navigation
   File: navbar-dropdown.js  (FINAL — covers all 24 sections)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Every possible label for each section ──────────────────────────── */
  /* Listed in matching priority order. Covers both mobile nav (short) and
     desktop nav (long with emoji prefix), plus section heading text.      */
  var LABELS = {
    'home':           ['Home'],
    'about':          ['About', 'About the Project'],
    'archive-map':    ['Archive Map'],
    'media':          ['Media Section', 'Media'],
    'recipe-videos':  ['Recipe Videos', '154 Recipe Videos'],
    'coverage':       ['Media Coverage', 'Coverage'],
    'academia':       ['Global Academia', 'Academia', 'Global Academic'],
    'team':           ['Our Team', 'Team'],
    'special-credit': ['Special Credit'],
    'credits':        ['Other Credits', 'Credits', 'Significant'],
    'acknowledgement':['Acknowledgement', 'Acknowledgements'],
    'submissions':    ['Submissions'],
    'review':         ['Contribute a Review', 'Review'],
    'blog-submit':    ['Submit a Blog', 'Blog Submit'],
    'edit-data':      ['Edit Data', 'Edit Archive'],
    'bibliography':   ['Bibliography'],
    'blogs':          ['Blogs', 'Academic Blogs'],
    'interviews':     ['Interviews'],
    'sustainability': ['Sustainability', 'Digital Sustainability'],
    'license':        ['License & Ethics', 'License', 'Ethics'],
    'faq':            ['FAQ', 'Frequently Asked'],
    'feedback':       ['Feedback', 'Share Your Feedback'],
    'contact':        ['Contact', 'Get In Touch'],
    'cite':           ['Cite This Project', 'Cite', 'How to Cite']
  };

  /* ── Cached nav UL and items ────────────────────────────────────────── */
  var _navUL = null;

  function findNavUL() {
    if (_navUL) return _navUL;
    /* Fingerprint: the real nav UL contains all three of these unique items */
    var uls = document.querySelectorAll('ul');
    for (var i = 0; i < uls.length; i++) {
      var u = uls[i];
      if (u.closest('#mmmm-dropdown-nav')) continue;
      var t = u.textContent;
      if (t.indexOf('Archive Map')   !== -1 &&
          t.indexOf('Recipe Videos') !== -1 &&
          t.indexOf('Blog Submit')   !== -1) {
        _navUL = u;
        return u;
      }
    }
    return null;
  }

  /* ── Text matching ──────────────────────────────────────────────────── */
  function elText(el) {
    return (el.textContent || '').trim().replace(/\s+/g, ' ');
  }

  function elMatches(el, labels) {
    var txt = elText(el);
    if (!txt || txt.length > 120) return false;
    return labels.some(function (l) {
      return txt === l ||
             txt.endsWith(l) ||
             txt.endsWith(' ' + l) ||
             (l.length >= 7 && txt.indexOf(l) !== -1);
    });
  }

  /* ── Click an element (and its clickable children) ──────────────────── */
  function fireClick(el) {
    /* standard programmatic click */
    el.click();

    /* more complete MouseEvent — works better with some frameworks */
    try {
      el.dispatchEvent(new MouseEvent('click', {
        bubbles: true, cancelable: true, view: window, button: 0
      }));
    } catch (e) {}

    /* also click any <a> or <button> children */
    var ch = el.querySelectorAll('a, button');
    for (var i = 0; i < ch.length; i++) { ch[i].click(); }
  }

  /* ── Core navigation ────────────────────────────────────────────────── */
  function doNavigate(target) {
    var labels = LABELS[target];
    if (!labels) return;

    /* ── PASS A: within the fingerprinted nav UL ────────────────────── */
    var navUL = findNavUL();
    if (navUL) {
      var navItems = navUL.querySelectorAll('li, a, button');
      for (var a = 0; a < navItems.length; a++) {
        if (elMatches(navItems[a], labels)) {
          fireClick(navItems[a]);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
    }

    /* ── PASS B: any nav / header element (not ours) ────────────────── */
    var navEls = document.querySelectorAll(
      'nav:not(#mmmm-dropdown-nav), header:not(#mmmm-dropdown-nav)'
    );
    for (var b = 0; b < navEls.length; b++) {
      var candidates = navEls[b].querySelectorAll('a, button, li, span');
      for (var bi = 0; bi < candidates.length; bi++) {
        var c = candidates[bi];
        if (c.closest('#mmmm-dropdown-nav')) continue;
        if (elMatches(c, labels)) {
          fireClick(c);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
    }

    /* ── PASS C: ALL <li> on page (not our nav, not footer) ─────────── */
    var allLi = document.querySelectorAll('li');
    for (var c2 = 0; c2 < allLi.length; c2++) {
      var li = allLi[c2];
      if (li.closest('#mmmm-dropdown-nav')) continue;
      if (li.closest('footer'))             continue;
      if (elMatches(li, labels)) {
        fireClick(li);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    /* ── PASS D: ALL <a> and <button> (not our nav, not footer) ─────── */
    var allAB = document.querySelectorAll('a, button');
    for (var d = 0; d < allAB.length; d++) {
      var el = allAB[d];
      if (el.closest('#mmmm-dropdown-nav')) continue;
      if (el.closest('footer'))             continue;
      if (elMatches(el, labels)) {
        fireClick(el);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    /* ── PASS E: hash navigation fallback ───────────────────────────── */
    window.location.hash = target;
    window.dispatchEvent(new Event('hashchange'));

    /* ── PASS F: scroll to matching heading as absolute last resort ──── */
    var heads = document.querySelectorAll('h1,h2,h3,h4');
    for (var f = 0; f < heads.length; f++) {
      if (heads[f].closest('#mmmm-dropdown-nav')) continue;
      if (elMatches(heads[f], labels)) {
        heads[f].scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
  }

  /* ═════════════════════════════════════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', function () {

    /* Pre-warm cache */
    setTimeout(findNavUL, 300);

    var nav    = document.getElementById('mmmm-dropdown-nav');
    var burger = document.getElementById('dd-burger');
    var menu   = document.getElementById('dd-menu');
    if (!nav) return;

    /* ── Hamburger ──────────────────────────────────────────────────── */
    if (burger && menu) {
      burger.addEventListener('click', function (e) {
        e.stopPropagation();
        var o = menu.classList.toggle('open');
        burger.classList.toggle('open', o);
        burger.setAttribute('aria-expanded', o);
      });
    }

    /* ── Dropdown toggles ───────────────────────────────────────────── */
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

    /* ── Section links ──────────────────────────────────────────────── */
    nav.querySelectorAll('[data-section]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeAll();
        closeMobile();
        doNavigate(el.dataset.section);
      });
    });

    /* ── Brand → Home ───────────────────────────────────────────────── */
    var brand = nav.querySelector('.dd-brand');
    if (brand) {
      brand.addEventListener('click', function (e) {
        e.preventDefault();
        closeAll(); closeMobile();
        doNavigate('home');
      });
    }

    /* ── Outside click closes ───────────────────────────────────────── */
    document.addEventListener('click', function () { closeAll(); closeMobile(); });
    nav.querySelectorAll('.dd-panel').forEach(function (p) {
      p.addEventListener('click', function (e) { e.stopPropagation(); });
    });

    /* ── Escape key ─────────────────────────────────────────────────── */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeAll(); closeMobile(); }
    });

    /* ── Sticky shadow ──────────────────────────────────────────────── */
    window.addEventListener('scroll', function () {
      nav.style.boxShadow = window.scrollY > 6
        ? '0 4px 28px rgba(0,0,0,.8)' : '0 2px 18px rgba(0,0,0,.65)';
    }, { passive: true });

    /* ── helpers ────────────────────────────────────────────────────── */
    function closeAll() {
      nav.querySelectorAll('.dd-item.open').forEach(function (i) {
        i.classList.remove('open');
        var b = i.querySelector('.dd-btn');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
    }
    function closeMobile() {
      if (menu)   menu.classList.remove('open');
      if (burger) {
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    }
  });

})();
