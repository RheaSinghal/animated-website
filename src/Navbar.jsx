import React, { useState, useEffect } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Also pause lenis if possible, but overflow hidden usually helps
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  return (
    <>
      <nav className="navbar">
        <div className="nav-logo" onClick={() => setIsOpen(false)}>
          BRAND
        </div>
        
        <button 
          className={`hamburger ${isOpen ? 'open' : ''}`} 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          <span className="line"></span>
          <span className="line"></span>
        </button>
      </nav>

      <div className={`nav-overlay ${isOpen ? 'open' : ''}`}>
        {/* Same background as base image */}
        <div className="nav-overlay-bg"></div>
        
        {/* Menu Items */}
        <div className="nav-overlay-content">
          <ul className="nav-links">
            <li><a href="#home" onClick={() => setIsOpen(false)}>Home</a></li>
            <li><a href="#work" onClick={() => setIsOpen(false)}>Work</a></li>
            <li><a href="#about" onClick={() => setIsOpen(false)}>About</a></li>
            <li><a href="#contact" onClick={() => setIsOpen(false)}>Contact</a></li>
          </ul>
        </div>
      </div>
    </>
  );
}
