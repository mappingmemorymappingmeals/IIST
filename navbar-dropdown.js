/**
 * Navbar Dropdown Controller - Comprehensive Navigation Handler
 * Automatically handles link mapping, smooth scrolling to sections, 
 * page routing, and dropdown toggle events across all devices.
 */

document.addEventListener('DOMContentLoaded', function () {
  // Map of link text terms (lowercase, normalized) -> Target Section ID or Route
  const PAGE_MAP = {
    'about': '#about',
    'archive map': '#archive-map',
    'archive': '#archive-map',
    'map': '#archive-map',
    'media': '#media',
    'media section': '#media',
    'recipe videos': '#recipe-videos',
    '154 recipe videos': '#recipe-videos',
    'videos': '#recipe-videos',
    'coverage': '#media-coverage',
    'media coverage': '#media-coverage',
    'academia': '#academia',
    'global academia': '#academia',
    'team': '#team',
    'our team': '#team',
    'special credit': '#credits',
    'credits': '#credits',
    'other credits': '#credits',
    'acknowledgement': '#acknowledgements',
    'acknowledgements': '#acknowledgements',
    'submissions': '#submissions',
    'review': '#review',
    'contribute a review': '#review',
    'blog submit': '#blog-submit',
    'submit a blog': '#blog-submit',
    'edit data': '#edit-data',
    'edit': '#edit-data',
    'bibliography': '#bibliography',
    'blogs': '#blogs',
    'interviews': '#interviews',
    'sustainability': '#sustainability',
    'license': '#license',
    'license & ethics': '#license',
    'faq': '#faq',
    'feedback': '#feedback',
    'contact': '#contact',
    'cite': '#cite',
    'cite this project': '#cite',
    'repo': 'https://github.com/mappingmemorymappingmeals/mappingmemoryproject'
  };

  /**
   * Clean text string for consistent matching (removes emojis, icons, whitespace)
   */
  function normalizeText(str) {
    if (!str) return '';
    return str
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // strip emojis
      .replace(/[^\w\s]/gi, '') // strip punctuation/icons
      .toLowerCase()
      .trim();
  }

  /**
   * Handles opening/closing dropdown toggles on mobile & desktop
   */
  function initDropdownToggles() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle, .nav-dropdown-toggle, [data-toggle="dropdown"]');
    
    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        const parent = this.parentElement;
        
        // Close other open dropdowns
        document.querySelectorAll('.dropdown.open, .nav-item.open').forEach(item => {
          if (item !== parent) item.classList.remove('open', 'show');
        });

        parent.classList.toggle('open');
        parent.classList.toggle('show');
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function () {
      document.querySelectorAll('.dropdown.open, .nav-dropdown-toggle.open, .show').forEach(item => {
        item.classList.remove('open', 'show');
      });
    });
  }

  /**
   * Attaches smart routing to all navigation links
   */
  function bindNavLinks() {
    const navLinks = document.querySelectorAll('nav a, .navbar a, .dropdown-menu a, .nav-link, .dropdown-item');

    navLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        const rawText = this.innerText || this.textContent;
        const cleanText = normalizeText(rawText);
        const href = this.getAttribute('href');

        // Check map for target
        let targetDestination = null;
        for (const [key, value] of Object.entries(PAGE_MAP)) {
          if (cleanText.includes(key) || key.includes(cleanText)) {
            targetDestination = value;
            break;
          }
        }

        // If target exists in our map
        if (targetDestination) {
          if (targetDestination.startsWith('#')) {
            const targetElement = document.querySelector(targetDestination);
            
            // If on the same page with target element present -> Smooth Scroll
            if (targetElement) {
              e.preventDefault();
              targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

              // Close mobile navigation menu if open
              const navCollapse = document.querySelector('.navbar-collapse, .nav-menu');
              if (navCollapse) navCollapse.classList.remove('show', 'active', 'open');
            } else {
              // If target element is not on the current page, redirect to index page with target hash
              if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
                e.preventDefault();
                window.location.href = '/' + targetDestination;
              }
            }
          } else if (targetDestination.startsWith('http')) {
            // External routing (e.g. Repo)
            e.preventDefault();
            window.open(targetDestination, '_blank');
          }
        }
      });
    });
  }

  // Run initialization
  initDropdownToggles();
  bindNavLinks();
});
