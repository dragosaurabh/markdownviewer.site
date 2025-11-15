/**
 * Standalone Dark Mode Toggle - Guaranteed to Work
 * This is a simple, bulletproof implementation
 */

// Apply theme immediately (before DOM loads)
(function() {
  const theme = localStorage.getItem('theme') || 'light';
  if (theme === 'dark') {
    document.documentElement.classList.add('dark-mode');
  }
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🌓 Dark mode initializing...');
  
  const toggle = document.getElementById('dark-mode-toggle');
  
  if (!toggle) {
    console.error('❌ Dark mode toggle button not found!');
    return;
  }
  
  console.log('✅ Dark mode toggle button found');
  
  // Apply saved theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);
  console.log('📱 Applied saved theme:', savedTheme);
  
  // Handle toggle click
  toggle.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    console.log('🔄 Toggling from', currentTheme, 'to', newTheme);
    
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    console.log('💾 Theme saved:', newTheme);
  });
  
  console.log('✅ Dark mode initialized successfully!');
});

function applyTheme(theme) {
  const html = document.documentElement;
  const body = document.body;
  
  if (theme === 'dark') {
    html.classList.add('dark-mode');
    body.classList.add('dark-mode');
  } else {
    html.classList.remove('dark-mode');
    body.classList.remove('dark-mode');
  }
}
