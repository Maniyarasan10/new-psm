import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

function initReveals() {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.revealDelay;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, delay ? Number(delay) : 0);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach((el, i) => {
    if (!el.dataset.revealDelay) {
      el.dataset.revealDelay = String((i % 6) * 80);
    }
    observer.observe(el);
  });
}

export default function Layout() {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  // Initialize reveal animations on every page
  useEffect(() => {
    initReveals();
  }, [pathname]);

  return (
    <>
      <Navigation />
      <main id="top">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
