/**
 * Vedius Vedasto - Personal Freelance Portfolio
 * Main JavaScript Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Drawer Navigation
  const mobileToggle = document.getElementById('mobileNavToggle');
  const drawer = document.getElementById('mobileDrawer');
  const drawerClose = document.getElementById('drawerClose');
  const backdrop = document.getElementById('drawerBackdrop');

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
    if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', openDrawer);
  }

  if (drawerClose) {
    drawerClose.addEventListener('click', closeDrawer);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeDrawer);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  const drawerLinks = document.querySelectorAll('.drawer-link');
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // 2. Project Category Filtering
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (filterButtons.length > 0 && projectCards.length > 0) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Toggle active button
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter || category.includes(filter)) {
            card.style.display = 'flex';
            card.style.animation = 'fadeIn 0.4s ease forwards';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // 3. Static Site Notice
  // Direct communication channels (WhatsApp, Email, Phone) are static links, no form submission required.

  // 4. Case Study Tab Navigation (if on case studies page)
  const caseTabs = document.querySelectorAll('.case-nav-btn');
  const caseArticles = document.querySelectorAll('.case-study-item');

  if (caseTabs.length > 0 && caseArticles.length > 0) {
    caseTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        caseTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const targetId = tab.getAttribute('data-target');
        caseArticles.forEach(art => {
          if (art.id === targetId) {
            art.style.display = 'block';
            art.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            art.style.display = 'none';
          }
        });
      });
    });
  }
});
