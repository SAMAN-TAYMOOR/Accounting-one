
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const menuBtn = document.getElementById('menu-btn') || document.querySelector('.menu-icon');
  const sidebar = document.getElementById('sidebar');
  const closeBtn = document.getElementById('close-btn');
  const overlay = document.getElementById('overlay');
  const modeToggle = document.getElementById('mode-toggle');
  const navLinks = Array.from(document.querySelectorAll('#ulist a'));

  /* ---------- Accessibility attributes ---------- */
  if(menuBtn) menuBtn.setAttribute('aria-controls', 'sidebar');
  if(menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  if(sidebar) sidebar.setAttribute('aria-hidden', 'true');

  /* ---------- Sidebar open/close ---------- */
  let lastFocused = null;
  function openSidebar(){
    if(!sidebar) return;
    sidebar.classList.add('open');
    overlay?.classList.add('visible');
    body.classList.add('no-scroll');
    sidebar.setAttribute('aria-hidden', 'false');
    if(menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
    // focus first link for keyboard users
    const first = navLinks[0];
    if(first){ lastFocused = document.activeElement; first.focus(); }
  }
  function closeSidebar(){
    if(!sidebar) return;
    sidebar.classList.remove('open');
    overlay?.classList.remove('visible');
    body.classList.remove('no-scroll');
    sidebar.setAttribute('aria-hidden', 'true');
    if(menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    if(lastFocused) lastFocused.focus();
  }

  menuBtn?.addEventListener('click', () => {
    // toggle behaviour on small screens
    if(sidebar.classList.contains('open')) closeSidebar(); else openSidebar();
  });
  closeBtn?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);

  // close with Esc (mobile only)
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && sidebar?.classList.contains('open')){
      if(window.innerWidth < 1000) closeSidebar();
    }
  });

  /* ---------- Dark mode (localStorage + prefers-color-scheme) ---------- */
  const saved = localStorage.getItem('theme');
  if(saved === 'dark'){
    body.classList.add('dark');
    if(modeToggle) modeToggle.checked = true;
  } else if(saved === 'light'){
    body.classList.remove('dark');
    if(modeToggle) modeToggle.checked = false;
  } else {
    // no saved preference -> use system pref
    const prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if(prefers){ body.classList.add('dark'); if(modeToggle) modeToggle.checked = true }
  }

  modeToggle?.addEventListener('change', (e) => {
    if(e.target.checked){ body.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { body.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  });

  /* ---------- Active link highlight (click) ---------- */
  function clearActive(){ navLinks.forEach(a => a.classList.remove('active')) }
  navLinks.forEach(link => {
    link.addEventListener('click', (ev) => {
      clearActive();
      link.classList.add('active');
      // close sidebar on small screens
      if(window.innerWidth < 1000) closeSidebar();
    });
  });

  /* ---------- Active highlight by scroll (IntersectionObserver) ---------- */
  const sections = navLinks.map(a => {
    const href = a.getAttribute('href');
    if(!href || !href.startsWith('#')) return null;
    return document.querySelector(href);
  }).filter(Boolean);

  if('IntersectionObserver' in window && sections.length){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting && entry.target.id){
          clearActive();
          const link = document.querySelector(`#ulist a[href="#${entry.target.id}"]`);
          if(link) link.classList.add('active');
        }
      });
    },{ root: null, rootMargin: `-20% 0px -40% 0px`, threshold: 0.15 });

    sections.forEach(s => io.observe(s));
  }

  /* ---------- Small UX: close on resize to mobile, keep open on desktop ---------- */
  function syncSidebarOnResize(){
    if(window.innerWidth >= 1000){
      // ensure sidebar visible on desktop (CSS also allows this)
      sidebar?.classList.add('open');
      overlay?.classList.remove('visible');
      body.classList.remove('no-scroll');
    } else {
      // mobile: keep it closed initially
      sidebar?.classList.remove('open');
      overlay?.classList.remove('visible');
      body.classList.remove('no-scroll');
    }
  }
  window.addEventListener('resize', syncSidebarOnResize);
  syncSidebarOnResize();

  /* ---------- Helpful accessibility tweaks ---------- */
  // Make sure keyboard users can tab into sidebar links
  navLinks.forEach(a => a.setAttribute('tabindex', '0'));

});