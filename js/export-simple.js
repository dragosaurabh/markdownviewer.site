// ===================================
// Simple Export Controller - No External Dependencies
// ===================================

class SimpleExportController {
  constructor() {
    this.currentContent = null;
    this.currentMarkdown = '';
    this.currentTitle = 'document';
  }

  /**
   * Initialize export functionality
   */
  init() {
    console.log('[SimpleExport] Initializing...');
    this.setupExportButtons();
  }

  /**
   * Setup export buttons
   */
  setupExportButtons() {
    const exportBtn = document.getElementById('export-btn');
    const exportMenu = document.getElementById('export-menu');
    
    if (exportBtn && exportMenu) {
      exportBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        exportMenu.classList.toggle('show');
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', () => {
        exportMenu.classList.remove('show');
      });
      
      exportMenu.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
    
    // Setup individual export format buttons
    const exportPdf = document.getElementById('export-pdf');
    const exportDocx = document.getElementById('export-docx');
    const exportHtml = document.getElementById('export-html');
    const exportTxt = document.getElementById('export-txt');
    const exportMd = document.getElementById('export-md');
    
    if (exportPdf) {
      exportPdf.addEventListener('click', () => {
        exportMenu?.classList.remove('show');
        this.exportToPDF();
      });
    }
    
    if (exportDocx) {
      exportDocx.addEventListener('click', () => {
        exportMenu?.classList.remove('show');
        this.exportToWord();
      });
    }
    
    if (exportHtml) {
      exportHtml.addEventListener('click', () => {
        exportMenu?.classList.remove('show');
        this.exportToHTML();
      });
    }
    
    if (exportTxt) {
      exportTxt.addEventListener('click', () => {
        exportMenu?.classList.remove('show');
        this.exportToText();
      });
    }
    
    if (exportMd) {
      exportMd.addEventListener('click', () => {
        exportMenu?.classList.remove('show');
        this.exportToMarkdown();
      });
    }
    
    console.log('[SimpleExport] Export buttons setup complete');
  }

  /**
   * Update current content for export
   * @param {string} content - HTML content
   * @param {string} markdown - Markdown content
   * @param {string} title - Document title
   */
  updateContent(content, markdown, title = 'document') {
    this.currentContent = content;
    this.currentMarkdown = markdown;
    this.currentTitle = this.sanitizeFilename(title);
    console.log('[SimpleExport] Content updated:', this.currentTitle);
  }

  /**
   * Sanitize filename
   * @param {string} filename - Original filename
   * @returns {string} Sanitized filename
   */
  sanitizeFilename(filename) {
    return filename
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'document';
  }

  /**
   * Download file using simple method
   * @param {string} content - File content
   * @param {string} filename - File name
   * @param {string} mimeType - MIME type
   */
  downloadFile(content, filename, mimeType) {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('[SimpleExport] Download failed:', error);
      return false;
    }
  }

  /**
   * Export to PDF (using print)
   */
  exportToPDF() {
    if (!this.currentContent) {
      showToast('Please load some markdown content first', 'error');
      return;
    }

    try {
      showToast('Opening print dialog for PDF...', 'info', 2000);
      
      // Use browser's print to PDF functionality
      setTimeout(() => {
        window.print();
      }, 500);
      
      showToast('Use "Save as PDF" in the print dialog', 'success', 3000);
      
    } catch (error) {
      console.error('[SimpleExport] PDF export failed:', error);
      showToast('PDF export failed. Please try again.', 'error');
    }
  }

  /**
   * Export to Word (DOCX) - Simple HTML format
   */
  exportToWord() {
    if (!this.currentContent) {
      showToast('Please load some markdown content first', 'error');
      return;
    }

    try {
      const content = document.getElementById('markdown-output');
      if (!content) {
        throw new Error('Content not found');
      }

      // Create a simple Word-compatible HTML
      const wordHTML = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${this.currentTitle}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
    h1 { font-size: 24pt; font-weight: bold; margin-bottom: 12pt; }
    h2 { font-size: 18pt; font-weight: bold; margin-bottom: 10pt; margin-top: 16pt; }
    h3 { font-size: 14pt; font-weight: bold; margin-bottom: 8pt; margin-top: 12pt; }
    p { margin-bottom: 10pt; }
    code { font-family: 'Courier New', monospace; background: #f5f5f5; padding: 2px 4px; }
    pre { background: #f5f5f5; padding: 10px; border: 1px solid #ddd; overflow-x: auto; }
    blockquote { border-left: 4px solid #ddd; padding-left: 16px; margin: 16px 0; color: #666; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f5f5f5; font-weight: bold; }
  </style>
</head>
<body>
  ${content.innerHTML}
</body>
</html>`;

      const success = this.downloadFile(
        wordHTML,
        `${this.currentTitle}.doc`,
        'application/msword'
      );

      if (success) {
        showToast('Word document exported successfully!', 'success');
      } else {
        throw new Error('Download failed');
      }
      
    } catch (error) {
      console.error('[SimpleExport] Word export failed:', error);
      showToast('Word export failed. Please try again.', 'error');
    }
  }

  /**
   * Export to HTML
   */
  exportToHTML() {
    if (!this.currentContent) {
      showToast('Please load some markdown content first', 'error');
      return;
    }

    try {
      const content = document.getElementById('markdown-output');
      if (!content) {
        throw new Error('Content not found');
      }

      const isDarkMode = document.body.classList.contains('dark-mode');
      
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.currentTitle}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism${isDarkMode ? '-tomorrow' : ''}.min.css">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: ${isDarkMode ? '#e5e7eb' : '#111827'};
      background: ${isDarkMode ? '#1f2937' : '#ffffff'};
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 2rem;
      margin-bottom: 1rem;
      font-weight: 600;
      line-height: 1.2;
    }
    h1 { font-size: 2.5rem; }
    h2 { font-size: 2rem; }
    h3 { font-size: 1.5rem; }
    code {
      background: ${isDarkMode ? '#374151' : '#f3f4f6'};
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    pre {
      background: ${isDarkMode ? '#374151' : '#f3f4f6'};
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
    }
    pre code {
      background: none;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #3b82f6;
      padding-left: 1rem;
      margin: 1rem 0;
      color: ${isDarkMode ? '#9ca3af' : '#6b7280'};
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
    }
    th, td {
      border: 1px solid ${isDarkMode ? '#374151' : '#e5e7eb'};
      padding: 0.75rem;
      text-align: left;
    }
    th {
      background: ${isDarkMode ? '#374151' : '#f9fafb'};
      font-weight: 600;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    a {
      color: #3b82f6;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  ${content.innerHTML}
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-python.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-css.min.js"></script>
</body>
</html>`;

      const success = this.downloadFile(
        html,
        `${this.currentTitle}.html`,
        'text/html;charset=utf-8'
      );

      if (success) {
        showToast('HTML exported successfully!', 'success');
      } else {
        throw new Error('Download failed');
      }
      
    } catch (error) {
      console.error('[SimpleExport] HTML export failed:', error);
      showToast('HTML export failed. Please try again.', 'error');
    }
  }

  /**
   * Export to plain text
   */
  exportToText() {
    if (!this.currentContent) {
      showToast('Please load some markdown content first', 'error');
      return;
    }

    try {
      const content = document.getElementById('markdown-output');
      if (!content) {
        throw new Error('Content not found');
      }

      const text = content.textContent || content.innerText;
      
      const success = this.downloadFile(
        text,
        `${this.currentTitle}.txt`,
        'text/plain;charset=utf-8'
      );

      if (success) {
        showToast('Text file exported successfully!', 'success');
      } else {
        throw new Error('Download failed');
      }
      
    } catch (error) {
      console.error('[SimpleExport] Text export failed:', error);
      showToast('Text export failed. Please try again.', 'error');
    }
  }

  /**
   * Export to Markdown
   */
  exportToMarkdown() {
    if (!this.currentMarkdown) {
      showToast('No markdown content available. Please load some markdown first.', 'error');
      return;
    }

    try {
      const success = this.downloadFile(
        this.currentMarkdown,
        `${this.currentTitle}.md`,
        'text/markdown;charset=utf-8'
      );

      if (success) {
        showToast('Markdown exported successfully!', 'success');
      } else {
        throw new Error('Download failed');
      }
      
    } catch (error) {
      console.error('[SimpleExport] Markdown export failed:', error);
      showToast('Markdown export failed. Please try again.', 'error');
    }
  }
}

// Make SimpleExportController available globally
window.SimpleExportController = SimpleExportController;

// Initialize on load and make available globally
window.simpleExportController = null;

function initSimpleExport() {
  console.log('[SimpleExport] Initializing global export controller...');
  window.simpleExportController = new SimpleExportController();
  window.simpleExportController.init();
  console.log('[SimpleExport] Global export controller ready');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSimpleExport);
} else {
  initSimpleExport();
}
