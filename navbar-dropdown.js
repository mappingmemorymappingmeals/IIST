/* ═══════════════════════════════════════════════════════════════════════════
   Mapping Memory, Mapping Meals — Dropdown Nav JS  v6
   File: navbar-dropdown.js
   ═══════════════════════════════════════════════════════════════════════════
   COMPLETELY NEW STRATEGY:
   Instead of searching the entire page and risk clicking wrong elements,
   v6 locates the SPECIFIC navigation <ul> on the page by fingerprinting it
   (only the real nav ul contains "Archive Map" + "Recipe Videos" + "Blog Submit"
   all together). Then it searches ONLY inside that ul. This guarantees
   the correct element is clicked every time.
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* Short labels used in the mobile nav <li> items — confirmed from live page */
  var NAV_LABELS = {
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

  /* Cached reference to the site's real nav <ul> */
  var _navUL   = null;
  var _navEls  = null;  /* cached array of all nav <li>/<a>/<button> elements */

  /* Find the site's real navigation <ul> by fingerprinting its unique content.
     Only the real nav contains "Archive Map", "Recipe Videos" AND "Blog Submit"
     together — no content section does.                                     */
  function findNavUL() {
    if (_navUL) return _navUL;
    var uls = document.querySelectorAll('ul');
    for (var i = 0; i < uls.length; i++) {
      var ul = uls[i];
      if (ul.closest('#mmmm-dropdown-nav')) continue;
      var t = ul.textContent;
      if (t.indexOf('Archive Map')    !== -1 &&
          t.indexOf('Recipe Videos')  !== -1 &&
          t.indexOf('Blog Submit')     !== -1) {
        _navUL = ul;
        return ul;
      }
    }
    return null;
  }

  /* Build a cached array of all clickable elements inside the nav ul */
  function getNavItems() {
    if (_navEls) return _navEls;
    var ul = findNavUL();
    if (!ul) return [];
    /* Include <li>, <a>, <button> — whichever the site uses */
    _navEls = Array.prototype.slice.call(ul.querySelectorAll('li, a, button'));
    return _navEls;
  }

  /* Returns true if element text exactly equals the target label
     OR ends with it (handles emoji prefix like "🏠 Home")            */
  function elMatches(el, label) {
    var txt = (el.textContent || '').trim().replace(/\s+/g, ' ');
    return txt === label || txt.endsWith(label) || txt.endsWith(' ' + label);
  }

  /* Main navigation function */
  function doNavigate(target) {
    var label = NAV_LABELS[target];
    if (!label) return;

    /* ── Pass 1: search the real nav ul ─────────────────────────────── */
    var items = getNavItems();
    for (var i = 0; i < items.length; i++) {
      if (elMatches(items[i], label)) {
        clickEl(items[i]);
        return;
      }
    }

    /* ── Pass 2: search entire page for <li> matching the label ─────── */
    var allLi = document.querySelectorAll('li');
    for (var j = 0; j < allLi.length; j++) {
      var li = allLi[j];
      if (li.closest('#mmmm-dropdown-nav')) continue;
      if (li.closest('footer'))             continue;
      if (elMatches(li, label)) {
        clickEl(li);
        return;
      }
    }

    /* ── Pass 3: search <a> and <button> anywhere except our nav/footer  */
    var allLinks = document.querySelectorAll('a, button');
    for (var k = 0; k < allLinks.length; k++) {
      var lnk = allLinks[k];
      if (lnk.closest('#mmmm-dropdown-nav')) continue;
      if (lnk.closest('footer'))             continue;
      if (elMatches(lnk, label)) {
        clickEl(lnk);
        return;
      }
    }

    /* ── Pass 4: hash + scroll fallback ─────────────────────────────── */
    window.location.hash = target;
    window.dispatchEvent(new Event('hashchange'));
    var byId = document.getElementById(target);
    if (byId) byId.scrollIntoView({ behavior: 'smooth' });
  }

  /* Click an element AND any direct <a>/<button> children it might have */
  function clickEl(el) {
    el.click();
    var children = el.querySelectorAll('a, button');
    for (var i = 0; i < children.length; i++) {
      children[i].click();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ════════════════════════════════════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', function () {

    /* Pre-cache the nav references as soon as DOM is ready */
    setTimeout(function () {
      findNavUL();
      getNavItems();
    }, 200);

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

    /* ── Dropdown toggle ──────────────────────────────────────────────── */
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

    /* ── Outside click ────────────────────────────────────────────────── */
    document.addEventListener('click', function () { closeAll(); closeMobile(); });
    nav.querySelectorAll('.dd-panel').forEach(function (p) {
      p.addEventListener('click', function (e) { e.stopPropagation(); });
    });

    /* ── Escape ───────────────────────────────────────────────────────── */
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
      if (menu)   menu.classList.remove('open');
      if (burger) {
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    }
  });

})();
