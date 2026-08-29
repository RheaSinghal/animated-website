import React, { useState, useEffect, useCallback } from 'react';

const Navbar = React.memo(function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Stable toggle handler
  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

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
        <div className="nav-logo" onClick={closeMenu}>
          BRAND
        </div>
        
        <button 
          className={`hamburger ${isOpen ? 'open' : ''}`} 
          onClick={toggleMenu}
          aria-label="Toggle Menu"
          aria-expanded={isOpen}
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
            <li><a href="#home" onClick={closeMenu}>Home</a></li>
            <li><a href="#work" onClick={closeMenu}>Work</a></li>
            <li><a href="#about" onClick={closeMenu}>About</a></li>
            <li><a href="#contact" onClick={closeMenu}>Contact</a></li>
          </ul>
        </div>
      </div>
    </>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
