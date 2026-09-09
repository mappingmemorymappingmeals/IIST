/* ═══════════════════════════════════════════════════════════════════════════
   Mapping Memory, Mapping Meals — Dropdown Nav JS  v4  (COMPLETE FIX)
   File: navbar-dropdown.js
   ═══════════════════════════════════════════════════════════════════════════
   ROOT CAUSE OF v3 FAILURES:
   Some nav <li> items have child elements (icons/spans) so their
   textContent is "📺 Recipe Videos" not just "Recipe Videos".
   Strict equality === was failing. v4 uses includes() + searches the
   ORIGINAL nav element first + tries 5 different strategies.
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── MAP: data-section → keywords that appear in that nav item's text ── */
  var SECTION_MAP = {
    'home':           'Home',
    'about':          'About',
    'archive-map':    'Archive Map',
    'media':          'Media Section',
    'recipe-videos':  'Recipe Videos',
    'coverage':       'Media Coverage',
    'academia':       'Global Academia',
    'team':           'Our Team',
    'special-credit': 'Special Credit',
    'credits':        'Other Credits',
    'acknowledgement':'Acknowledgement',
    'submissions':    'Submissions',
    'review':         'Contribute a Review',
    'blog-submit':    'Submit a Blog',
    'edit-data':      'Edit Data',
    'bibliography':   'Bibliography',
    'blogs':          'Blogs',
    'interviews':     'Interviews',
    'sustainability': 'Sustainability',
    'license':        'License',
    'faq':            'FAQ',
    'feedback':       'Feedback',
    'contact':        'Contact',
    'cite':           'Cite This Project'
  };

  /* Also keep short fallback keywords for includes() matching */
  var FALLBACK_MAP = {
    'home':           'Home',
    'about':          'About',
    'archive-map':    'Archive Map',
    'media':          'Media',
    'recipe-videos':  'Recipe Videos',
    'coverage':       'Coverage',
    'academia':       'Academia',
    'team':           'Team',
    'special-credit': 'Special Credit',
    'credits':        'Credits',
    'acknowledgement':'Acknowledgement',
    'submissions':    'Submissions',
    'review':         'Review',
    'blog-submit':    'Blog',
    'edit-data':      'Edit Data',
    'bibliography':   'Bibliography',
    'blogs':          'Blogs',
    'interviews':     'Interviews',
    'sustainability': 'Sustainability',
    'license':        'License',
    'faq':            'FAQ',
    'feedback':       'Feedback',
    'contact':        'Contact',
    'cite':           'Cite'
  };

  function doNavigate(target) {
    var navText     = SECTION_MAP[target]   || '';
    var fallback    = FALLBACK_MAP[target]  || navText;

    /* ── STRATEGY 1: click inside the ORIGINAL site nav/header ─────────
       Searches every clickable element inside any nav or header that is
       NOT our new dropdown nav. Uses includes() so emoji prefixes are ok. */
    var origNavs = document.querySelectorAll(
      'nav:not(#mmmm-dropdown-nav), header:not(#mmmm-dropdown-nav)'
    );
    for (var n = 0; n < origNavs.length; n++) {
      var candidates = origNavs[n].querySelectorAll('a, button, li, span, div');
      for (var c = 0; c < candidates.length; c++) {
        var el  = candidates[c];
        var txt = el.textContent.trim().replace(/\s+/g, ' ');
        if (txt.length > 60) continue; /* skip long paragraphs */
        if (navText && (txt === navText || txt.includes(navText))) {
          el.click(); return true;
        }
        if (fallback && txt.includes(fallback)) {
          el.click(); return true;
        }
      }
    }

    /* ── STRATEGY 2: search ALL <li> on page (mobile nav) ──────────────
       Uses includes() instead of strict equality to handle icon prefixes. */
    var allLi = document.querySelectorAll('li');
    for (var i = 0; i < allLi.length; i++) {
      if (allLi[i].closest('#mmmm-dropdown-nav')) continue;
      var t = allLi[i].textContent.trim().replace(/\s+/g, ' ');
      if (t.length > 60) continue;
      if (navText && (t === navText || t.includes(navText))) {
        allLi[i].click(); return true;
      }
      if (fallback && t.includes(fallback) && fallback.length > 3) {
        allLi[i].click(); return true;
      }
    }

    /* ── STRATEGY 3: search ALL <a> and <button> (not footer, not our nav)  */
    var allLinks = document.querySelectorAll(
      'a:not(#mmmm-dropdown-nav a):not(footer a), ' +
      'button:not(#mmmm-dropdown-nav button):not(footer button)'
    );
    for (var j = 0; j < allLinks.length; j++) {
      var t2 = allLinks[j].textContent.trim().replace(/\s+/g, ' ');
      if (t2.length > 80) continue;
      if (navText && (t2 === navText || t2.includes(navText))) {
        allLinks[j].click(); return true;
      }
      if (fallback && t2.includes(fallback) && fallback.length > 4) {
        allLinks[j].click(); return true;
      }
    }

    /* ── STRATEGY 4: try window.location.hash then hashchange event ──── */
    var hashTargets = [target, target.replace(/-/g, ''), navText.toLowerCase().replace(/\s+/g, '-')];
    window.location.hash = hashTargets[0];
    window.dispatchEvent(new Event('hashchange'));

    /* ── STRATEGY 5: scroll to element with matching ID ─────────────── */
    var byId = document.getElementById(target) ||
               document.getElementById(target.replace(/-/g, ''));
    if (byId) { byId.scrollIntoView({ behavior: 'smooth' }); return true; }

    return false;
  }

  /* ════════════════════════════════════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', function () {

    var nav    = document.getElementById('mmmm-dropdown-nav');
    var burger = document.getElementById('dd-burger');
    var menu   = document.getElementById('dd-menu');
    if (!nav) return;

    /* ── 1. Hamburger ─────────────────────────────────────────────── */
    if (burger && menu) {
      burger.addEventListener('click', function (e) {
        e.stopPropagation();
        var o = menu.classList.toggle('open');
        burger.classList.toggle('open', o);
        burger.setAttribute('aria-expanded', o);
      });
    }

    /* ── 2. Dropdown toggles ──────────────────────────────────────── */
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

    /* ── 3. Section navigation ────────────────────────────────────── */
    nav.querySelectorAll('[data-section]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeAll();
        closeMobile();
        doNavigate(el.dataset.section);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    /* ── 4. Brand → Home ──────────────────────────────────────────── */
    var brand = nav.querySelector('.dd-brand');
    if (brand) {
      brand.addEventListener('click', function (e) {
        e.preventDefault();
        closeAll(); closeMobile();
        doNavigate('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    /* ── 5. Close on outside click ────────────────────────────────── */
    document.addEventListener('click', function () { closeAll(); closeMobile(); });
    nav.querySelectorAll('.dd-panel').forEach(function (p) {
      p.addEventListener('click', function (e) { e.stopPropagation(); });
    });

    /* ── 6. Escape key ────────────────────────────────────────────── */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeAll(); closeMobile(); }
    });

    /* ── 7. Sticky shadow ─────────────────────────────────────────── */
    window.addEventListener('scroll', function () {
      nav.style.boxShadow = window.scrollY > 6
        ? '0 4px 28px rgba(0,0,0,.8)' : '0 2px 18px rgba(0,0,0,.65)';
    }, { passive: true });

    /* ── helpers ──────────────────────────────────────────────────── */
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
