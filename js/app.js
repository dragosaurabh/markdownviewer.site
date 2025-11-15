// ===================================
// Main Application
// ===================================

class MarkdownViewerApp {
  constructor() {
    this.renderer = null;
    this.uiController = null;
    this.searchModule = null;
    this.currentMarkdown = '';
  }
  
  /**
   * Initialize application
   */
  init() {
    // Wait for DOM and libraries to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }
  
  /**
   * Setup application
   */
  setup() {
    // Initialize modules
    this.renderer = new MarkdownRenderer();
    this.uiController = new UIController();
    this.searchModule = new SearchModule();
    // Export is handled by export-inline.js (no controller needed)
    
    // Initialize UI
    this.uiController.init();
    
    // Setup event listeners
    this.setupURLInput();
    this.setupFileUpload();
    this.setupTextInput();
    // Export buttons are handled by export-inline.js
    this.setupShareButton();
    this.setupSearch();
    
    // Check for shared markdown in URL
    this.loadFromURL();
    
    // Load sample if no content
    this.loadSampleIfEmpty();
  }
  
  /**
   * Setup URL input
   */
  setupURLInput() {
    const form = document.getElementById('url-form');
    const input = document.getElementById('url-input');
    
    if (!form || !input) return;
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = input.value.trim();
      
      if (!url) {
        showError('url-error', 'Please enter a URL');
        return;
      }
      
      if (!isValidURL(url)) {
        showError('url-error', 'Please enter a valid URL');
        return;
      }
      
      hideError('url-error');
      await this.fetchMarkdownFromURL(url);
    });
  }
  
  /**
   * Fetch markdown from URL
   * @param {string} url - URL to fetch
   */
  async fetchMarkdownFromURL(url) {
    this.uiController.showLoading('url-loading');
    hideError('url-error');
    
    try {
      // Convert GitHub URLs to raw URLs
      const fetchUrl = convertGitHubToRaw(url);
      if (fetchUrl !== url) {
        console.log('[App] Converted GitHub URL to raw URL:', fetchUrl);
      }
      
      // Try direct fetch first
      let response;
      let markdown;
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // Increased timeout
        
        response = await fetch(fetchUrl, {
          signal: controller.signal,
          mode: 'cors',
          headers: {
            'Accept': 'text/plain, text/markdown, text/*, */*'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        markdown = await response.text();
      } catch (directError) {
        console.log('[App] Direct fetch failed, trying CORS proxy...', directError);
        
        // Try with CORS proxy - Updated with more reliable proxies
        const corsProxies = [
          `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
          `https://corsproxy.io/?${encodeURIComponent(url)}`,
          `https://cors-anywhere.herokuapp.com/${url}`,
          // For GitHub raw URLs, try converting to raw.githubusercontent.com
          url.includes('github.com') && !url.includes('raw.githubusercontent.com') 
            ? url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/')
            : null
        ].filter(Boolean);
        
        let proxySuccess = false;
        let lastError = null;
        
        for (const proxyUrl of corsProxies) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000); // Increased timeout
            
            response = await fetch(proxyUrl, {
              signal: controller.signal,
              headers: {
                'Accept': 'text/plain, text/markdown, text/*, */*'
              }
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
              markdown = await response.text();
              if (markdown && markdown.trim()) {
                proxySuccess = true;
                console.log('[App] Successfully loaded via CORS proxy');
                break;
              }
            }
          } catch (proxyError) {
            console.log('[App] Proxy attempt failed:', proxyError);
            lastError = proxyError;
            continue;
          }
        }
        
        if (!proxySuccess) {
          // Provide helpful error message
          let errorMsg = 'Failed to fetch from URL. ';
          if (url.includes('github.com')) {
            errorMsg += 'For GitHub files, try using the "Raw" button URL or raw.githubusercontent.com URL.';
          } else {
            errorMsg += 'The URL may not allow cross-origin requests. Try downloading the file and uploading it instead.';
          }
          throw new Error(errorMsg);
        }
      }
      
      if (!markdown || markdown.trim() === '') {
        throw new Error('The URL returned empty content');
      }
      
      this.renderMarkdown(markdown);
      
      // Save to recent files
      StorageManager.saveRecentFile({
        name: url.split('/').pop() || 'Untitled',
        content: markdown,
        source: 'url'
      });
      
      showToast('Markdown loaded successfully!', 'success');
    } catch (error) {
      console.error('[App] Failed to fetch markdown:', error);
      
      const errorMessage = getURLErrorMessage(url, error);
      
      showError('url-error', errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      this.uiController.hideLoading('url-loading');
    }
  }
  
  /**
   * Setup file upload
   */
  setupFileUpload() {
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    
    if (!fileInput || !dropZone) return;
    
    // File input change
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handleFile(file);
      }
    });
    
    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      
      const file = e.dataTransfer.files[0];
      if (file) {
        this.handleFile(file);
      }
    });
  }
  
  /**
   * Handle file upload
   * @param {File} file - Uploaded file
   */
  async handleFile(file) {
    hideError('upload-error');
    
    // Validate file type
    const validExtensions = ['.md', '.markdown', '.txt'];
    const fileName = file.name.toLowerCase();
    const isValidType = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidType) {
      showError('upload-error', 'Please upload a .md, .markdown, or .txt file');
      return;
    }
    
    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showError('upload-error', 'File size exceeds 5MB limit');
      return;
    }
    
    try {
      const markdown = await this.readFile(file);
      this.renderMarkdown(markdown);
      
      // Save to recent files
      StorageManager.saveRecentFile({
        name: file.name,
        content: markdown,
        source: 'upload'
      });
      
      showToast(`File "${file.name}" loaded successfully`, 'success');
    } catch (error) {
      console.error('Failed to read file:', error);
      showError('upload-error', 'Failed to read file');
      showToast('Failed to read file', 'error');
    }
  }
  
  /**
   * Read file content
   * @param {File} file - File to read
   * @returns {Promise<string>} File content
   */
  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }
  
  /**
   * Setup text input
   */
  setupTextInput() {
    const textInput = document.getElementById('text-input');
    const charCount = document.getElementById('char-count');
    const copyBtn = document.getElementById('copy-markdown-btn');
    
    if (!textInput) return;
    
    // Debounced render
    const debouncedRender = debounce((markdown) => {
      this.renderMarkdown(markdown);
    }, 300);
    
    textInput.addEventListener('input', (e) => {
      const markdown = e.target.value;
      
      // Update character count
      if (charCount) {
        const count = markdown.length;
        charCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
      }
      
      // Render markdown
      debouncedRender(markdown);
    });
    
    // Copy markdown button
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const markdown = textInput.value;
        const success = await copyToClipboard(markdown);
        
        if (success) {
          showToast('Markdown copied to clipboard', 'success');
        } else {
          showToast('Failed to copy markdown', 'error');
        }
      });
    }
  }
  
  /**
   * Render markdown
   * @param {string} markdown - Markdown text
   */
  renderMarkdown(markdown) {
    const output = document.getElementById('markdown-output');
    if (!output) return;
    
    this.currentMarkdown = markdown;
    
    if (!markdown || markdown.trim() === '') {
      output.innerHTML = `
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <rect x="8" y="16" width="48" height="32" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M16 24h32M16 32h32M16 40h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <h2>No Markdown Loaded</h2>
          <p>Choose an input method above to get started</p>
        </div>
      `;
      return;
    }
    
    // Render markdown
    const html = this.renderer.render(markdown);
    output.innerHTML = html;
    
    // Process rendered HTML
    this.renderer.processRenderedHTML(output);
    
    // Generate TOC
    TOCGenerator.generate(output);
    
    // Extract title for export
    const firstHeading = output.querySelector('h1, h2');
    const title = firstHeading ? firstHeading.textContent : 'document';
    
    // Save markdown and title for export
    StorageManager.saveLastMarkdown(markdown, title);
    
    // Update export system with markdown content
    if (typeof window.updateExportContent === 'function') {
      window.updateExportContent(markdown, title);
    }
    
    // Announce to screen readers
    output.setAttribute('aria-live', 'polite');
  }
  
  /**
   * Setup export buttons
   */
  setupExportButtons() {
    const exportHTMLBtn = document.getElementById('export-html-btn');
    const copyBtn = document.getElementById('copy-btn');
    const copyMenu = document.getElementById('copy-menu');
    const copyAsText = document.getElementById('copy-as-text');
    const copyAsMarkdown = document.getElementById('copy-as-markdown');
    
    if (exportHTMLBtn) {
      exportHTMLBtn.addEventListener('click', () => {
        this.exportAsHTML();
      });
    }
    
    // Copy button dropdown
    if (copyBtn && copyMenu) {
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyMenu.classList.toggle('show');
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', () => {
        copyMenu.classList.remove('show');
      });
      
      copyMenu.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
    
    // Copy as text
    if (copyAsText) {
      copyAsText.addEventListener('click', async () => {
        await this.copyAsText();
        if (copyMenu) copyMenu.classList.remove('show');
      });
    }
    
    // Copy as markdown
    if (copyAsMarkdown) {
      copyAsMarkdown.addEventListener('click', async () => {
        await this.copyAsMarkdown();
        if (copyMenu) copyMenu.classList.remove('show');
      });
    }
  }
  
  /**
   * Export as HTML
   */
  exportAsHTML() {
    if (!this.currentMarkdown) {
      showToast('No markdown to export', 'warning');
      return;
    }
    
    const html = this.generateStandaloneHTML();
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `markdown-export-${timestamp}.html`;
    
    downloadFile(html, filename, 'text/html');
    showToast('HTML file downloaded', 'success');
  }
  
  /**
   * Generate standalone HTML
   * @returns {string} Complete HTML document
   */
  generateStandaloneHTML() {
    const renderedHTML = document.getElementById('markdown-output').innerHTML;
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Export</title>
  <style>
    ${this.getExportStyles(isDarkMode)}
  </style>
</head>
<body>
  <div class="markdown-content">
    ${renderedHTML}
  </div>
</body>
</html>`;
  }
  
  /**
   * Get export styles
   * @param {boolean} isDarkMode - Whether dark mode is active
   * @returns {string} CSS styles
   */
  getExportStyles(isDarkMode) {
    const theme = isDarkMode ? 'dark' : 'light';
    return `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
        ${isDarkMode ? 'background: #1F2937; color: #F9FAFB;' : 'background: #FFFFFF; color: #111827;'}
      }
      .markdown-content h1, .markdown-content h2 { border-bottom: 2px solid ${isDarkMode ? '#374151' : '#E5E7EB'}; padding-bottom: 0.3em; }
      .markdown-content code { background: ${isDarkMode ? '#111827' : '#F3F4F6'}; padding: 0.2em 0.4em; border-radius: 3px; }
      .markdown-content pre { background: ${isDarkMode ? '#111827' : '#F3F4F6'}; padding: 1rem; border-radius: 5px; overflow-x: auto; }
      .markdown-content pre code { background: none; padding: 0; }
      .markdown-content blockquote { border-left: 4px solid ${isDarkMode ? '#60A5FA' : '#3B82F6'}; padding-left: 1rem; margin: 1rem 0; }
      .markdown-content table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
      .markdown-content th, .markdown-content td { border: 1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}; padding: 0.5rem; }
      .markdown-content img { max-width: 100%; height: auto; }
      .markdown-content a { color: ${isDarkMode ? '#60A5FA' : '#3B82F6'}; }
    `;
  }
  
  /**
   * Copy as text (plain text from preview)
   */
  async copyAsText() {
    if (!this.currentMarkdown) {
      showToast('No content to copy', 'warning');
      return;
    }
    
    const output = document.getElementById('markdown-output');
    if (!output) {
      showToast('No content to copy', 'warning');
      return;
    }
    
    const text = output.textContent || output.innerText;
    const success = await copyToClipboard(text);
    
    if (success) {
      showToast('Text copied to clipboard', 'success');
    } else {
      showToast('Failed to copy text', 'error');
    }
  }
  
  /**
   * Copy as markdown (original markdown source)
   */
  async copyAsMarkdown() {
    if (!this.currentMarkdown) {
      showToast('No markdown to copy', 'warning');
      return;
    }
    
    const success = await copyToClipboard(this.currentMarkdown);
    
    if (success) {
      showToast('Markdown copied to clipboard', 'success');
    } else {
      showToast('Failed to copy markdown', 'error');
    }
  }
  
  /**
   * Setup share button
   */
  setupShareButton() {
    const shareBtn = document.getElementById('share-btn');
    
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        this.generateShareableLink();
      });
    }
  }
  
  /**
   * Generate shareable link
   */
  generateShareableLink() {
    if (!this.currentMarkdown) {
      showToast('No markdown to share', 'warning');
      return;
    }
    
    try {
      const encoded = encodeBase64(this.currentMarkdown);
      const url = new URL(window.location.href);
      url.searchParams.set('md', encoded);
      
      const shareURL = url.toString();
      
      // Warn if URL is too long
      if (shareURL.length > 2000) {
        showToast('Warning: Shareable link is very long and may not work in all browsers', 'warning', 5000);
      }
      
      copyToClipboard(shareURL).then(success => {
        if (success) {
          showToast('Shareable link copied to clipboard', 'success');
        } else {
          showToast('Failed to copy link', 'error');
        }
      });
    } catch (error) {
      console.error('Failed to generate shareable link:', error);
      showToast('Failed to generate shareable link', 'error');
    }
  }
  
  /**
   * Load markdown from URL parameter
   */
  loadFromURL() {
    const encoded = getQueryParam('md');
    if (encoded) {
      try {
        const markdown = decodeBase64(encoded);
        if (markdown) {
          this.renderMarkdown(markdown);
          
          // Switch to text tab and populate
          const textInput = document.getElementById('text-input');
          if (textInput) {
            textInput.value = markdown;
            
            // Trigger tab switch
            const textTab = document.getElementById('text-tab');
            if (textTab) {
              textTab.click();
            }
          }
          
          showToast('Markdown loaded from shared link', 'success');
        }
      } catch (error) {
        console.error('Failed to load markdown from URL:', error);
        showToast('Failed to load shared markdown', 'error');
      }
    }
  }
  
  /**
   * Load sample markdown if empty
   */
  loadSampleIfEmpty() {
    // Only load sample if no content and no URL parameter
    if (!this.currentMarkdown && !getQueryParam('md')) {
      const sampleMarkdown = this.getSampleMarkdown();
      this.renderMarkdown(sampleMarkdown);
    }
  }
  
  /**
   * Get sample markdown
   * @returns {string} Sample markdown
   */
  getSampleMarkdown() {
    return `# Welcome to Markdown Viewer

This is a **free online markdown viewer** that lets you view, edit, and convert markdown files instantly.

## Features

- 🚀 **Lightning Fast** - Instant rendering with no signup required
- 🔒 **Privacy First** - All processing happens in your browser
- 🎨 **Syntax Highlighting** - Beautiful code blocks with Prism.js
- 🌙 **Dark Mode** - Easy on the eyes
- 📱 **Mobile Responsive** - Works on all devices

## How to Use

1. Choose your input method (URL, Upload, or Text)
2. Load your markdown content
3. View the beautifully rendered output
4. Export or share as needed

## Markdown Syntax Examples

### Text Formatting

You can make text **bold**, *italic*, or ~~strikethrough~~.

### Lists

Unordered list:
- Item 1
- Item 2
  - Nested item

Ordered list:
1. First item
2. Second item
3. Third item

### Code

Inline code: \`const greeting = "Hello World";\`

Code block:
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
\`\`\`

### Links and Images

[Visit our website](https://yourdomain.com)

### Blockquotes

> This is a blockquote.
> It can span multiple lines.

### Tables

| Feature | Status |
|---------|--------|
| URL Input | ✅ |
| File Upload | ✅ |
| Text Input | ✅ |
| Dark Mode | ✅ |

### Task Lists

- [x] Completed task
- [ ] Pending task
- [ ] Another pending task

---

**Try it out!** Switch to the URL, Upload, or Text tab above to load your own markdown content.`;
  }
  
  /**
   * Setup search functionality
   */
  setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchNext = document.getElementById('search-next');
    const searchPrev = document.getElementById('search-prev');
    
    if (!searchInput) return;
    
    const debouncedSearch = debounce((query) => {
      this.searchModule.search(query);
    }, 200);
    
    searchInput.addEventListener('input', (e) => {
      debouncedSearch(e.target.value);
    });
    
    if (searchNext) {
      searchNext.addEventListener('click', () => {
        this.searchModule.nextMatch();
      });
    }
    
    if (searchPrev) {
      searchPrev.addEventListener('click', () => {
        this.searchModule.previousMatch();
      });
    }
    
    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          this.searchModule.previousMatch();
        } else {
          this.searchModule.nextMatch();
        }
      }
    });
  }
}

// ===================================
// Initialize Application
// ===================================

const app = new MarkdownViewerApp();
app.init();
