import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Section = ({ title, content, id }) => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    
    gsap.fromTo(
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
};

export default function Sections() {
  const dummyText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`;

  return (
    <div style={{ backgroundColor: 'transparent', position: 'relative', zIndex: 1 }}>
      <Section id="work" title="Our Work" content={dummyText} />
      <Section id="about" title="About Us" content={dummyText} />
      <Section id="contact" title="Get in Touch" content={dummyText} />
    </div>
  );
}
