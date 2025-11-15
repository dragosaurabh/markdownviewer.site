/**
 * Dark Mode Toggle - Robust Implementation
 * Works on all pages with proper error handling
 */

(function() {
  'use strict';
  
  console.log('Dark mode script loaded');
  
  // Apply theme immediately to prevent flash
  function applyThemeImmediately() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    console.log('Applying saved theme:', savedTheme);
    
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark-mode');
      if (document.body) {
        document.body.classList.add('dark-mode');
      }
    }
  }
  
  // Apply theme right away
  applyThemeImmediately();
  
  // Initialize dark mode toggle when DOM is ready
  function initDarkMode() {
    console.log('Initializing dark mode toggle');
    
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    if (!darkModeToggle) {
      console.error('Dark mode toggle button not found! Looking for id="dark-mode-toggle"');
      return;
    }
    
    console.log('Dark mode toggle button found');
    
    // Get current theme
    const currentTheme = localStorage.getItem('theme') || 'light';
    console.log('Current theme:', currentTheme);
    
    // Apply current theme
    updateTheme(currentTheme, false);
    
    // Add click event listener
    darkModeToggle.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Dark mode toggle clicked');
      
      const isDark = document.body.classList.contains('dark-mode');
      const newTheme = isDark ? 'light' : 'dark';
      
      console.log('Switching from', isDark ? 'dark' : 'light', 'to', newTheme);
      
      updateTheme(newTheme, true);
      localStorage.setItem('theme', newTheme);
      
      console.log('Theme saved to localStorage:', newTheme);
    });
    
    console.log('Dark mode initialized successfully');
  }
  
  // Update theme function
  function updateTheme(theme, log = true) {
    if (log) {
      console.log('Updating theme to:', theme);
    }
    
    const html = document.documentElement;
    const body = document.body;
    
    if (theme === 'dark') {
      html.classList.add('dark-mode');
      body.classList.add('dark-mode');
      if (log) console.log('Dark mode classes added');
    } else {
      html.classList.remove('dark-mode');
      body.classList.remove('dark-mode');
      if (log) console.log('Dark mode classes removed');
    }
  }
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDarkMode);
  } else {
    // DOM is already ready
    initDarkMode();
  }
  
  // Also try after a short delay as backup
  setTimeout(function() {
    if (!document.getElementById('dark-mode-toggle')) {
      console.warn('Dark mode toggle still not found after delay');
    }
  }, 1000);
  
})();
