/* ═══════════════════════════════════════════════════════════════════════════
   Mapping Memory, Mapping Meals — Dropdown Nav JS  v3  (DEFINITIVE FIX)
   File: navbar-dropdown.js
   ═══════════════════════════════════════════════════════════════════════════
   ROOT CAUSE OF PREVIOUS FAILURE:
   The site's navigation works by clicking <li> items whose TEXT CONTENT
   matches labels like "About", "Archive Map", "Recipe Videos" etc.
   The previous versions were searching for data-section attributes which
   don't exist on those elements. This version finds the correct <li>
   by text content and clicks it — triggering your existing site JS.
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── LOOKUP TABLE: data-section  →  exact text of the site's <li> nav item
     These MUST match what your mobile nav <li> items say exactly.         */
  var SECTION_MAP = {
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
    'blog-submit':    'Blog Submit',
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

  document.addEventListener('DOMContentLoaded', function () {

    var nav    = document.getElementById('mmmm-dropdown-nav');
    var burger = document.getElementById('dd-burger');
    var menu   = document.getElementById('dd-menu');
    if (!nav) return;

    /* ── 1. Hamburger ──────────────────────────────────────────────────── */
    if (burger && menu) {
      burger.addEventListener('click', function (e) {
        e.stopPropagation();
        var o = menu.classList.toggle('open');
        burger.classList.toggle('open', o);
        burger.setAttribute('aria-expanded', o);
      });
    }

    /* ── 2. Dropdown toggles ───────────────────────────────────────────── */
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

    /* ── 3. DEFINITIVE NAVIGATION FIX ─────────────────────────────────── */
    nav.querySelectorAll('[data-section]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeAll();
        closeMobile();

        var target  = el.dataset.section;
        var navText = SECTION_MAP[target];

        if (!navText) return;

        /* Find ALL <li> elements on the page that are NOT inside our new nav
           and whose trimmed text content matches the target label exactly.
           Click the first match — this triggers the site's existing JS.    */
        var allLi = document.querySelectorAll('li');
        var matched = false;

        for (var i = 0; i < allLi.length; i++) {
          var li = allLi[i];

          /* Skip items inside our new dropdown nav */
          if (li.closest('#mmmm-dropdown-nav')) continue;

          var text = li.textContent.trim();

          if (text === navText) {
            li.click();
            matched = true;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            break;
          }
        }

        /* Fallback: also try <a> and <button> elements with matching text  */
        if (!matched) {
          var allClickable = document.querySelectorAll('a, button');
          for (var j = 0; j < allClickable.length; j++) {
            var el2 = allClickable[j];
            if (el2.closest('#mmmm-dropdown-nav')) continue;
            var t2 = el2.textContent.trim();
            if (t2 === navText || t2.endsWith(navText)) {
              el2.click();
              matched = true;
              window.scrollTo({ top: 0, behavior: 'smooth' });
              break;
            }
          }
        }

        /* Last fallback: scroll to element with matching ID               */
        if (!matched) {
          var byId = document.getElementById(target);
          if (byId) byId.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    /* ── 4. Brand → Home ───────────────────────────────────────────────── */
    var brand = nav.querySelector('.dd-brand');
    if (brand) {
      brand.addEventListener('click', function (e) {
        e.preventDefault();
        closeAll(); closeMobile();
        /* Find the Home <li> and click it */
        var allLi = document.querySelectorAll('li');
        for (var i = 0; i < allLi.length; i++) {
          if (allLi[i].closest('#mmmm-dropdown-nav')) continue;
          if (allLi[i].textContent.trim() === 'Home') {
            allLi[i].click();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            break;
          }
        }
      });
    }

    /* ── 5. Close on outside click ─────────────────────────────────────── */
    document.addEventListener('click', function () { closeAll(); closeMobile(); });
    nav.querySelectorAll('.dd-panel').forEach(function (p) {
      p.addEventListener('click', function (e) { e.stopPropagation(); });
    });

    /* ── 6. Escape key ──────────────────────────────────────────────────── */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeAll(); closeMobile(); }
    });

    /* ── 7. Sticky shadow ───────────────────────────────────────────────── */
    window.addEventListener('scroll', function () {
      nav.style.boxShadow = window.scrollY > 6
        ? '0 4px 28px rgba(0,0,0,.8)' : '0 2px 18px rgba(0,0,0,.65)';
    }, { passive: true });

    /* ── helpers ─────────────────────────────────────────────────────────── */
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
