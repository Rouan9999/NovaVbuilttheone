/* ══════════════════════════════════════════════════
   Built By Nova — Scroll animations, nav & slider
   ══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Hero entrance ────────────────────────────── */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add('page-ready');
    });
  });

  /* ── Nav scroll ───────────────────────────────── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const sync = () => nav.classList.toggle('scrolled', window.scrollY > 24);
    window.addEventListener('scroll', sync, { passive: true });
    sync();
  }

  /* ── Scroll reveal ────────────────────────────── */
  const els = document.querySelectorAll('[data-anim]');

  if ('IntersectionObserver' in window && els.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el    = entry.target;
          const delay = parseInt(el.dataset.delay || '0', 10);
          setTimeout(() => el.classList.add('show'), delay);
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -32px 0px' }
    );
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.add('show'));
  }

  /* ── Smooth anchor links ──────────────────────── */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ── Transformation slider ────────────────────── */
  const slider = document.getElementById('tx-slider');
  if (slider) {
    const track   = slider.querySelector('.tx-slider__track');
    const slides  = slider.querySelectorAll('.tx-slider__slide');
    const dots    = slider.querySelectorAll('.slider-dot');
    const btnPrev = slider.querySelector('[data-prev]');
    const btnNext = slider.querySelector('[data-next]');
    let current = 0, auto;

    function goTo(n) {
      current = ((n % slides.length) + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function startAuto() {
      auto = setInterval(() => goTo(current + 1), 5000);
    }

    function bump() {
      clearInterval(auto);
      startAuto();
    }

    if (btnPrev) btnPrev.addEventListener('click', () => { goTo(current - 1); bump(); });
    if (btnNext) btnNext.addEventListener('click', () => { goTo(current + 1); bump(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); bump(); }));

    let touchX = 0;
    slider.addEventListener('touchstart', (e) => {
      touchX = e.touches[0].clientX;
    }, { passive: true });
    slider.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) { goTo(dx < 0 ? current + 1 : current - 1); bump(); }
    });

    goTo(0);
    startAuto();
  }

})();
