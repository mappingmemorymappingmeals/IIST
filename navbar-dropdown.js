/* ═══════════════════════════════════════════════════════════════════════════
   Mapping Memory, Mapping Meals — Dropdown Nav JS (FIXED)
   File: navbar-dropdown.js
   Replace the old navbar-dropdown.js in your repo with this file.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

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

    /* ── 3. NAVIGATION FIX — handles section switching ─────────────────── */
    nav.querySelectorAll('[data-section]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var target = el.dataset.section;

        closeAll();
        closeMobile();

        /* --- Method A: click the matching item in the ORIGINAL nav ------- */
        /* This finds any element outside our new nav that has the same
           data-section value — i.e. your original nav buttons — and
           clicks it so your existing site JS handles the switch.           */
        var originalNavItems = document.querySelectorAll(
          '[data-section="' + target + '"]'
        );
        var clicked = false;
        originalNavItems.forEach(function (item) {
          if (!item.closest('#mmmm-dropdown-nav') && !clicked) {
            item.click();
            clicked = true;
          }
        });
        if (clicked) return;

        /* --- Method B: try common site navigation function names --------- */
        var fnNames = [
          'showSection', 'navigateTo', 'navigate', 'goTo',
          'switchSection', 'loadSection', 'showPage', 'goToSection'
        ];
        for (var i = 0; i < fnNames.length; i++) {
          if (typeof window[fnNames[i]] === 'function') {
            window[fnNames[i]](target);
            return;
          }
        }

        /* --- Method C: dispatch hash change (works with href="#section") - */
        window.location.hash = target;
        window.dispatchEvent(new HashChangeEvent('hashchange'));

        /* --- Method D: directly show/hide sections by ID ----------------- */
        /* Finds every element that looks like a content section and
           shows the one whose id matches our target, hides the rest.       */
        var allSections = document.querySelectorAll(
          'section[id], div[id].section, div[id].page, ' +
          'div[id].content-section, div[id].page-section, ' +
          '[data-page], [data-nav-section]'
        );

        if (allSections.length > 0) {
          allSections.forEach(function (sec) {
            if (sec.id === target || sec.dataset.page === target ||
                sec.dataset.navSection === target) {
              sec.style.display = '';
              sec.style.visibility = 'visible';
              sec.style.opacity   = '1';
              sec.removeAttribute('hidden');
              sec.classList.remove('hidden', 'inactive', 'hide', 'd-none');
              sec.classList.add('active', 'visible');
            } else {
              sec.style.display = 'none';
              sec.classList.remove('active', 'visible');
              sec.classList.add('hidden');
            }
          });
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        /* --- Method E: last resort — scroll to element with that ID ------ */
        var el2 = document.getElementById(target);
        if (el2) {
          el2.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    /* ── 4. Brand → Home ───────────────────────────────────────────────── */
    var brand = nav.querySelector('.dd-brand');
    if (brand) {
      brand.addEventListener('click', function (e) {
        e.preventDefault();
        closeAll(); closeMobile();
        var homeBtn = document.querySelector(
          '[data-section="home"]:not(#mmmm-dropdown-nav [data-section])'
        );
        if (homeBtn) { homeBtn.click(); return; }
        window.location.hash = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
