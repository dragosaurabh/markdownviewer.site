// ===================================
// Editor App - Main Application
// ===================================

class EditorApp {
  constructor() {
    this.core = null;
    this.toolbar = null;
    this.seo = null;
    this.ai = null;
    this.templates = null;
  }
  
  init() {
    console.log('[EditorApp] Initializing...');
    
    // Wait for DOM and libraries
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }
  
  setup() {
    // Check for required libraries
    if (typeof marked === 'undefined') {
      console.error('[EditorApp] marked.js not loaded');
      this.showError('Required library (marked.js) not loaded. Please refresh the page.');
      return;
    }
    
    if (typeof DOMPurify === 'undefined') {
      console.error('[EditorApp] DOMPurify not loaded');
      this.showError('Required library (DOMPurify) not loaded. Please refresh the page.');
      return;
    }
    
    // Initialize components
    try {
      this.core = new EditorCore();
      this.seo = new EditorSEO();
      this.ai = new EditorAI();
      this.templates = new EditorTemplates(this.core);
      this.toolbar = new EditorToolbar(this.core);
      
      // Make globally available
      window.editorCore = this.core;
      window.editorSEO = this.seo;
      window.editorAI = this.ai;
      window.editorTemplates = this.templates;
      
      // Initialize all components
      this.core.init();
      this.toolbar.init();
      this.seo.init();
      this.ai.init();
      this.templates.init();
      
      // Setup additional features
      this.setupSplitResizer();
      this.setupExport();
      this.setupDarkMode();
      
      console.log('[EditorApp] Initialized successfully');
      
      // Show welcome message
      setTimeout(() => {
        showToast('Editor ready! Start typing to see live preview.', 'success', 3000);
      }, 500);
      
    } catch (error) {
      console.error('[EditorApp] Initialization failed:', error);
      this.showError('Failed to initialize editor. Please refresh the page.');
    }
  }
  
  setupSplitResizer() {
    const resizer = document.getElementById('split-resizer');
    const editorPane = document.getElementById('editor-pane');
    const previewPane = document.getElementById('preview-pane');
    
    if (!resizer || !editorPane || !previewPane) return;
    
    let isResizing = false;
    
    resizer.addEventListener('mousedown', (e) => {
      isResizing = true;
      resizer.classList.add('resizing');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      
      const container = document.querySelector('.split-view');
      const containerRect = container.getBoundingClientRect();
      const offsetX = e.clientX - containerRect.left;
      const percentage = (offsetX / containerRect.width) * 100;
      
      // Limit between 20% and 80%
      if (percentage >= 20 && percentage <= 80) {
        editorPane.style.flex = `0 0 ${percentage}%`;
        previewPane.style.flex = `0 0 ${100 - percentage}%`;
      }
    });
    
    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        resizer.classList.remove('resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    });
  }
  
  setupExport() {
    const exportBtn = document.getElementById('export-btn-editor');
    if (!exportBtn) return;
    
    exportBtn.addEventListener('click', () => {
      this.showExportMenu();
    });
  }
  
  showExportMenu() {
    // Create export menu if it doesn't exist
    let menu = document.getElementById('editor-export-menu');
    
    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'editor-export-menu';
      menu.className = 'export-menu';
      menu.innerHTML = `
        <button class="export-menu-item" data-format="md">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 7v10M6 7v10M9 7v10M12 7v10M15 7v10M18 7v10M21 7v10" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>Export as Markdown</span>
        </button>
        <button class="export-menu-item" data-format="html">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <polyline points="16 18 22 12 16 6" stroke="currentColor" stroke-width="2"/>
            <polyline points="8 6 2 12 8 18" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>Export as HTML</span>
        </button>
        <button class="export-menu-item" data-format="txt">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
            <polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>Export as Text</span>
        </button>
        <button class="export-menu-item" data-format="pdf">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
            <polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>Export as PDF</span>
        </button>
      `;
      
      document.body.appendChild(menu);
      
      // Add click handlers
      menu.querySelectorAll('.export-menu-item').forEach(item => {
        item.addEventListener('click', () => {
          const format = item.dataset.format;
          this.exportAs(format);
          menu.classList.remove('show');
        });
      });
      
      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && e.target.id !== 'export-btn-editor') {
          menu.classList.remove('show');
        }
      });
    }
    
    // Position menu
    const btn = document.getElementById('export-btn-editor');
    const rect = btn.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.right = `${window.innerWidth - rect.right}px`;
    
    menu.classList.toggle('show');
  }
  
  exportAs(format) {
    const content = this.core.getValue();
    
    if (!content || content.trim() === '') {
      showToast('Please write some content first', 'warning');
      return;
    }
    
    const title = this.extractTitle(content) || 'document';
    const filename = this.sanitizeFilename(title);
    
    switch (format) {
      case 'md':
        this.downloadFile(content, `${filename}.md`, 'text/markdown');
        showToast('Markdown exported successfully!', 'success');
        break;
      case 'html':
        const html = this.generateHTML(content, title);
        this.downloadFile(html, `${filename}.html`, 'text/html');
        showToast('HTML exported successfully!', 'success');
        break;
      case 'txt':
        const preview = document.getElementById('preview-content');
        const text = preview ? preview.textContent : content;
        this.downloadFile(text, `${filename}.txt`, 'text/plain');
        showToast('Text exported successfully!', 'success');
        break;
      case 'pdf':
        showToast('Opening print dialog for PDF...', 'info');
        setTimeout(() => window.print(), 500);
        break;
    }
  }
  
  extractTitle(content) {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1] : null;
  }
  
  sanitizeFilename(filename) {
    return filename
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'document';
  }
  
  generateHTML(markdown, title) {
    const html = marked.parse(markdown);
    const clean = DOMPurify.sanitize(html);
    const isDark = document.body.classList.contains('dark-mode');
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism${isDark ? '-tomorrow' : ''}.min.css">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: ${isDark ? '#e5e7eb' : '#111827'};
      background: ${isDark ? '#1f2937' : '#ffffff'};
    }
    h1, h2, h3 { margin-top: 2rem; margin-bottom: 1rem; font-weight: 600; }
    h1 { font-size: 2.5rem; }
    h2 { font-size: 2rem; }
    h3 { font-size: 1.5rem; }
    code { background: ${isDark ? '#374151' : '#f3f4f6'}; padding: 0.2em 0.4em; border-radius: 3px; }
    pre { background: ${isDark ? '#374151' : '#f3f4f6'}; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #3b82f6; padding-left: 1rem; margin: 1rem 0; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { border: 1px solid ${isDark ? '#374151' : '#e5e7eb'}; padding: 0.75rem; text-align: left; }
    th { background: ${isDark ? '#374151' : '#f9fafb'}; font-weight: 600; }
    img { max-width: 100%; height: auto; }
    a { color: #3b82f6; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  ${clean}
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js"></script>
</body>
</html>`;
  }
  
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
  
  setupDarkMode() {
    const toggle = document.getElementById('dark-mode-toggle');
    if (!toggle) return;
    
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      document.documentElement.classList.toggle('dark-mode');
      
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      
      // Update Prism theme
      const prismTheme = document.getElementById('prism-theme');
      if (prismTheme) {
        prismTheme.href = isDark
          ? 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css'
          : 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css';
      }
      
      // Re-render preview
      if (this.core) {
        this.core.updatePreview();
      }
    });
    
    // Apply saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark-mode');
    }
  }
  
  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #fee2e2;
      color: #991b1b;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 10000;
      max-width: 400px;
      text-align: center;
    `;
    errorDiv.innerHTML = `
      <h3 style="margin: 0 0 1rem 0;">Error</h3>
      <p style="margin: 0 0 1rem 0;">${message}</p>
      <button onclick="location.reload()" style="padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Reload Page
      </button>
    `;
    document.body.appendChild(errorDiv);
  }
}

// Initialize app
const editorApp = new EditorApp();
editorApp.init();
