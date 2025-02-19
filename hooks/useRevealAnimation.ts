import { useEffect } from 'react';

export function useRevealAnimation() {
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    };

    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all elements with reveal-animation class
    document.querySelectorAll('.reveal-animation, .reveal-grid').forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);
}
