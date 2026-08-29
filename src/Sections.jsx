import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Static section data — extracted outside component to avoid recreation on every render
const SECTIONS_DATA = [
  {
    id: 'work',
    title: 'Our Work',
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`,
  },
  {
    id: 'about',
    title: 'About Us',
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`,
  },
  {
    id: 'contact',
    title: 'Get in Touch',
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`,
  },
];

/**
 * Section — memoized to prevent unnecessary re-renders.
 * Each section independently manages its own ScrollTrigger.
 */
const Section = React.memo(({ title, content, id }) => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    
    const animation = gsap.fromTo(
      el,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%', // Trigger when top of element hits 80% of viewport
          toggleActions: 'play none none reverse', // Animate in, reverse on scroll up
        }
      }
    );

    // Cleanup: kill ScrollTrigger and animation to prevent memory leaks
    return () => {
      if (animation.scrollTrigger) {
        animation.scrollTrigger.kill();
      }
      animation.kill();
    };
  }, []);

  return (
    <section id={id} className="content-section">
      <div className="section-inner" ref={sectionRef}>
        <h2>{title}</h2>
        <p>{content}</p>
        <p>{content}</p>
      </div>
    </section>
  );
});

Section.displayName = 'Section';

export default function Sections() {
  return (
    <div style={{ backgroundColor: 'transparent', position: 'relative', zIndex: 1 }}>
      {SECTIONS_DATA.map((section) => (
        <Section
          key={section.id}
          id={section.id}
          title={section.title}
          content={section.content}
        />
      ))}
    </div>
  );
}
