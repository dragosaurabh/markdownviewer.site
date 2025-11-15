// ===================================
// UI Controller
// ===================================

class UIController {
  constructor() {
    this.currentTab = 'url';
    this.isReadingMode = false;
  }
  
  /**
   * Initialize UI
   */
  init() {
    this.setupTabSwitching();
    this.setupThemeToggle();
    this.setupToolbarControls();
    this.setupSearchBar();
    this.setupScrollProgress();
    this.setupKeyboardShortcuts();
  }
  
  /**
   * Setup tab switching
   */
  setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.input-panel');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.dataset.tab;
        
        // Update buttons
        tabButtons.forEach(btn => {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
        });
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');
        
        // Update panels
        tabPanels.forEach(panel => {
          panel.classList.remove('active');
          panel.hidden = true;
        });
        
        const activePanel = document.getElementById(`${tabName}-panel`);
        if (activePanel) {
          activePanel.classList.add('active');
          activePanel.hidden = false;
        }
        
        this.currentTab = tabName;
      });
    });
  }
  
  /**
   * Setup theme toggle
   */
  setupThemeToggle() {
    const themeToggle = document.getElementById('dark-mode-toggle');
    if (!themeToggle) return;
    
    themeToggle.addEventListener('click', () => {
      this.toggleTheme();
    });
    
    // Apply saved theme on load
    this.applyTheme();
  }
  
  /**
   * Toggle theme
   */
  toggleTheme() {
    const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    console.log('[UI] Toggling theme from', currentTheme, 'to', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
    }
    
    StorageManager.saveTheme(newTheme);
    this.updatePrismTheme(newTheme);
    
    console.log('[UI] Theme toggled successfully');
  }
  
  /**
   * Apply theme from storage
   */
  applyTheme() {
    const savedTheme = StorageManager.getTheme();
    let theme = savedTheme;
    
    console.log('[UI] Applying saved theme:', savedTheme);
    
    // Handle auto theme
    if (savedTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
      console.log('[UI] Auto theme detected:', theme);
    }
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
    }
    
    this.updatePrismTheme(theme);
    console.log('[UI] Theme applied successfully');
  }
  
  /**
   * Update Prism.js theme
   * @param {string} theme - Theme name
   */
  updatePrismTheme(theme) {
    const prismTheme = document.getElementById('prism-theme');
    if (prismTheme) {
      if (theme === 'dark') {
        prismTheme.href = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css';
      } else {
        prismTheme.href = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css';
      }
    }
  }
  
  /**
   * Setup toolbar controls
   */
  setupToolbarControls() {
    // Reading mode
    const readingModeBtn = document.getElementById('reading-mode-btn');
    if (readingModeBtn) {
      readingModeBtn.addEventListener('click', () => {
        this.toggleReadingMode();
      });
    }
    
    // Font size
    const fontSizeSelect = document.getElementById('font-size-select');
    if (fontSizeSelect) {
      fontSizeSelect.addEventListener('change', (e) => {
        this.changeFontSize(e.target.value);
      });
      
      // Load saved setting
      const settings = StorageManager.getSettings();
      fontSizeSelect.value = settings.fontSize;
      this.changeFontSize(settings.fontSize);
    }
    
    // Content width
    const contentWidthSelect = document.getElementById('content-width-select');
    if (contentWidthSelect) {
      contentWidthSelect.addEventListener('change', (e) => {
        this.changeContentWidth(e.target.value);
      });
      
      // Load saved setting
      const settings = StorageManager.getSettings();
      contentWidthSelect.value = settings.contentWidth;
      this.changeContentWidth(settings.contentWidth);
    }
    
    // TOC toggle for mobile
    const tocToggle = document.getElementById('toc-toggle');
    const tocSidebar = document.getElementById('toc-sidebar');
    if (tocToggle && tocSidebar) {
      tocToggle.addEventListener('click', () => {
        tocSidebar.classList.toggle('expanded');
      });
    }
  }
  
  /**
   * Toggle reading mode
   */
  toggleReadingMode() {
    this.isReadingMode = !this.isReadingMode;
    
    if (this.isReadingMode) {
      document.body.classList.add('reading-mode');
      this.setupReadingModeControls();
      // Scroll to top when entering reading mode
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.body.classList.remove('reading-mode');
    }
  }
  
  /**
   * Setup reading mode controls
   */
  setupReadingModeControls() {
    const exitBtn = document.getElementById('reading-mode-exit');
    const fontIncreaseBtn = document.getElementById('reading-mode-font-increase');
    const fontDecreaseBtn = document.getElementById('reading-mode-font-decrease');
    const content = document.getElementById('markdown-output');
    
    if (exitBtn) {
      exitBtn.onclick = () => this.toggleReadingMode();
    }
    
    if (fontIncreaseBtn && content) {
      fontIncreaseBtn.onclick = () => {
        const currentSize = parseFloat(window.getComputedStyle(content).fontSize);
        content.style.fontSize = `${currentSize + 2}px`;
        showToast('Font size increased', 'success', 1500);
      };
    }
    
    if (fontDecreaseBtn && content) {
      fontDecreaseBtn.onclick = () => {
        const currentSize = parseFloat(window.getComputedStyle(content).fontSize);
        if (currentSize > 12) {
          content.style.fontSize = `${currentSize - 2}px`;
          showToast('Font size decreased', 'success', 1500);
        }
      };
    }
    
    // Update reading time
    this.updateReadingTime();
  }
  
  /**
   * Update reading time estimate
   */
  updateReadingTime() {
    const content = document.getElementById('markdown-output');
    const readingTimeText = document.getElementById('reading-time-text');
    
    if (!content || !readingTimeText) return;
    
    const text = content.textContent || '';
    const wordCount = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
    
    readingTimeText.textContent = `${readingTime} min read`;
  }
  
  /**
   * Change font size
   * @param {string} size - Font size (small, medium, large)
   */
  changeFontSize(size) {
    const content = document.getElementById('markdown-output');
    if (!content) return;
    
    content.classList.remove('font-small', 'font-medium', 'font-large');
    content.classList.add(`font-${size}`);
    
    StorageManager.saveSettings({ fontSize: size });
  }
  
  /**
   * Change content width
   * @param {string} width - Content width (narrow, medium, wide)
   */
  changeContentWidth(width) {
    const content = document.getElementById('markdown-output');
    if (!content) return;
    
    content.classList.remove('width-narrow', 'width-medium', 'width-wide');
    content.classList.add(`width-${width}`);
    
    StorageManager.saveSettings({ contentWidth: width });
  }
  
  /**
   * Setup search bar
   */
  setupSearchBar() {
    const searchBtn = document.getElementById('search-btn');
    const searchBar = document.getElementById('search-bar');
    const searchClose = document.getElementById('search-close');
    const searchClear = document.getElementById('search-clear');
    const searchInput = document.getElementById('search-input');
    
    if (searchBtn && searchBar) {
      searchBtn.addEventListener('click', () => {
        searchBar.hidden = !searchBar.hidden;
        if (!searchBar.hidden) {
          searchInput?.focus();
        }
      });
    }
    
    if (searchClose && searchBar) {
      searchClose.addEventListener('click', () => {
        searchBar.hidden = true;
        if (searchInput) {
          searchInput.value = '';
        }
      });
    }
    
    if (searchClear && searchInput) {
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        // Trigger input event to clear search
        searchInput.dispatchEvent(new Event('input'));
      });
    }
  }
  
  /**
   * Setup scroll progress bar
   */
  setupScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) return;
    
    const updateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Calculate scroll percentage
      const scrollableHeight = documentHeight - windowHeight;
      const scrollPercent = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;
      
      // Update progress bar width
      progressBar.style.width = `${Math.min(Math.max(scrollPercent, 0), 100)}%`;
    };
    
    // Update on scroll
    window.addEventListener('scroll', updateProgress, { passive: true });
    
    // Update on resize
    window.addEventListener('resize', updateProgress, { passive: true });
    
    // Initial update
    updateProgress();
  }
  
  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Check for modifier key (Ctrl or Cmd)
      const modifier = e.ctrlKey || e.metaKey;
      
      if (modifier && e.key === 'u') {
        e.preventDefault();
        document.getElementById('file-input')?.click();
      } else if (modifier && e.key === 'o') {
        e.preventDefault();
        document.getElementById('url-input')?.focus();
      } else if (modifier && e.key === 'd') {
        e.preventDefault();
        this.toggleTheme();
      } else if (modifier && e.key === 'f') {
        e.preventDefault();
        const searchBar = document.getElementById('search-bar');
        if (searchBar) {
          searchBar.hidden = false;
          document.getElementById('search-input')?.focus();
        }
      } else if (modifier && e.key === 'p') {
        e.preventDefault();
        window.print();
      } else if (e.key === 'Escape') {
        if (this.isReadingMode) {
          this.toggleReadingMode();
        }
        const searchBar = document.getElementById('search-bar');
        if (searchBar && !searchBar.hidden) {
          searchBar.hidden = true;
        }
      }
    });
  }
  
  /**
   * Show loading indicator
   * @param {string} elementId - Loading element ID
   */
  showLoading(elementId) {
    const loading = document.getElementById(elementId);
    if (loading) {
      loading.classList.add('show');
    }
  }
  
  /**
   * Hide loading indicator
   * @param {string} elementId - Loading element ID
   */
  hideLoading(elementId) {
    const loading = document.getElementById(elementId);
    if (loading) {
      loading.classList.remove('show');
    }
  }
}
