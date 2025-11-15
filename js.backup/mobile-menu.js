/**
 * Mobile Menu Handler
 * Handles hamburger menu toggle on mobile devices
 */

(function() {
  'use strict';
  
  function initMobileMenu() {
    // Create mobile menu toggle button
    const nav = document.querySelector('.nav');
    const header = document.querySelector('.header-content');
    
    if (!nav || !header) {
      console.warn('[Mobile Menu] Nav or header not found');
      return;
    }
    
    // Check if toggle button already exists
    let mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (!mobileToggle) {
      // Create toggle button
      mobileToggle = document.createElement('button');
      mobileToggle.className = 'mobile-menu-toggle';
      mobileToggle.setAttribute('aria-label', 'Toggle mobile menu');
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
      `;
      
      // Insert before nav
      header.insertBefore(mobileToggle, nav);
    }
    
    // Toggle menu on button click
    mobileToggle.addEventListener('click', function() {
      const isOpen = nav.classList.contains('mobile-open');
      
      if (isOpen) {
        nav.classList.remove('mobile-open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        console.log('[Mobile Menu] Closed');
      } else {
        nav.classList.add('mobile-open');
        mobileToggle.classList.add('active');
        mobileToggle.setAttribute('aria-expanded', 'true');
        console.log('[Mobile Menu] Opened');
      }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!header.contains(e.target) && nav.classList.contains('mobile-open')) {
        nav.classList.remove('mobile-open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        console.log('[Mobile Menu] Closed (outside click)');
      }
    });
    
    // Close menu when clicking on a nav link
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
          nav.classList.remove('mobile-open');
          mobileToggle.classList.remove('active');
          mobileToggle.setAttribute('aria-expanded', 'false');
          console.log('[Mobile Menu] Closed (link clicked)');
        }
      });
    });
    
    // Close menu on window resize if opened
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768 && nav.classList.contains('mobile-open')) {
        nav.classList.remove('mobile-open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        console.log('[Mobile Menu] Closed (resize)');
      }
    });
    
    console.log('[Mobile Menu] Initialized');
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
  } else {
    initMobileMenu();
  }
})();
