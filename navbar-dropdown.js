/* ═══════════════════════════════════════════════════════════════════════════
   Mapping Memory, Mapping Meals — Dropdown Nav JS
   File: navbar-dropdown.js
   Upload to: root of your GitHub repo
   ═══════════════════════════════════════════════════════════════════════════
   HOW TO ADD: paste this ONE line just before </body> in your index.html:
   <script src="navbar-dropdown.js"></script>
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

    /* ── 3. Section navigation — hooks into the EXISTING site SPA ─────── */
    /*   Your site uses data-section attributes on nav items to switch
         visible sections. Every .dd-row[data-section] click below fires
         the same mechanism the existing nav uses, so your page JS handles
         the actual show/hide — this file just closes the dropdown after.  */
    nav.querySelectorAll('[data-section]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        var target = el.dataset.section;
        closeAll();
        closeMobile();

        // ① Try triggering your existing site navigation system.
        //   Method A: find a matching element in the ORIGINAL (now hidden)
        //   nav and click it — so your original JS fires.
        var original = document.querySelector(
          '[data-section="' + target + '"]:not(#mmmm-dropdown-nav [data-section])'
        );
        if (original) {
          original.click();
          return;
        }

        // ② Fallback: dispatch a custom 'navigate' event the site may listen for
        document.dispatchEvent(new CustomEvent('mmmm:navigate', { detail: target }));

        // ③ Fallback: show section by ID, hide all others
        var sections = document.querySelectorAll('[id]');
        sections.forEach(function (sec) {
          var show = (sec.id === target || sec.id === 'section-' + target);
          if (sec.tagName !== 'SCRIPT' && sec.tagName !== 'STYLE' &&
              !sec.closest('#mmmm-dropdown-nav')) {
            // only touch elements that look like content sections
            if (sec.dataset.navSection !== undefined ||
                sec.classList.contains('section') ||
                sec.classList.contains('page-section')) {
              sec.style.display = show ? '' : 'none';
            }
          }
        });
      });
    });

    /* ── 4. Brand click → Home ─────────────────────────────────────────── */
    var brand = nav.querySelector('.dd-brand');
    if (brand) {
      brand.addEventListener('click', function (e) {
        e.preventDefault();
        closeAll(); closeMobile();
        var homeEl = document.querySelector(
          '[data-section="home"]:not(#mmmm-dropdown-nav [data-section])'
        );
        if (homeEl) homeEl.click();
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

    /* ── 7. Sticky shadow on scroll ────────────────────────────────────── */
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
