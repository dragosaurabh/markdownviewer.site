// ===================================
// Inline Export System - Self-Contained
// ===================================

(function() {
  'use strict';
  
  console.log('[Export] Initializing inline export system...');
  
  let currentMarkdown = '';
  let currentTitle = 'document';
  
  // Wait for DOM to be ready
  function init() {
    console.log('[Export] DOM ready, setting up export...');
    
    const exportBtn = document.getElementById('export-btn');
    const exportMenu = document.getElementById('export-menu');
    
    if (!exportBtn || !exportMenu) {
      console.error('[Export] Export button or menu not found!');
      return;
    }
    
    console.log('[Export] Export button and menu found');
    
    // Toggle menu on button click
    exportBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      console.log('[Export] Export button clicked');
      exportMenu.classList.toggle('show');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function() {
      exportMenu.classList.remove('show');
    });
    
    // Prevent menu from closing when clicking inside it
    exportMenu.addEventListener('click', function(e) {
      e.stopPropagation();
    });
    
    // Setup export buttons
    setupExportButton('export-pdf', exportToPDF);
    setupExportButton('export-docx', exportToWord);
    setupExportButton('export-html', exportToHTML);
    setupExportButton('export-txt', exportToText);
    setupExportButton('export-md', exportToMarkdown);
    
    console.log('[Export] All export buttons setup complete');
    
    // Make update function globally available
    window.updateExportContent = function(markdown, title) {
      currentMarkdown = markdown || '';
      currentTitle = sanitizeFilename(title || 'document');
      console.log('[Export] Content updated:', currentTitle);
    };
  }
  
  function setupExportButton(id, handler) {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', function() {
        console.log('[Export] ' + id + ' clicked');
        const menu = document.getElementById('export-menu');
        if (menu) menu.classList.remove('show');
        handler();
      });
      console.log('[Export] Setup ' + id);
    } else {
      console.warn('[Export] Button not found: ' + id);
    }
  }
  
  function sanitizeFilename(filename) {
    return filename
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'document';
  }
  
  function downloadFile(content, filename, mimeType) {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      return true;
    } catch (error) {
      console.error('[Export] Download failed:', error);
      alert('Download failed: ' + error.message);
      return false;
    }
  }
  
  function showMessage(message, type) {
    // Try to use showToast if available, otherwise use alert
    if (typeof showToast === 'function') {
      showToast(message, type || 'info');
    } else {
      console.log('[Export] ' + message);
      if (type === 'error') {
        alert(message);
      }
    }
  }
  
  function getContent() {
    const output = document.getElementById('markdown-output');
    if (!output || !output.innerHTML.trim()) {
      showMessage('Please load some markdown content first', 'error');
      return null;
    }
    return output;
  }
  
  function exportToPDF() {
    console.log('[Export] PDF export started');
    if (!getContent()) return;
    
    showMessage('Opening print dialog for PDF...', 'info');
    setTimeout(function() {
      window.print();
      showMessage('Use "Save as PDF" in the print dialog', 'success');
    }, 500);
  }
  
  function exportToWord() {
    console.log('[Export] Word export started');
    const content = getContent();
    if (!content) return;
    
    const wordHTML = '<!DOCTYPE html>\n' +
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">\n' +
      '<head><meta charset="utf-8"><title>' + currentTitle + '</title>\n' +
      '<style>body{font-family:Arial;line-height:1.6;margin:40px;}' +
      'h1{font-size:24pt;font-weight:bold;margin-bottom:12pt;}' +
      'h2{font-size:18pt;font-weight:bold;margin-bottom:10pt;}' +
      'p{margin-bottom:10pt;}' +
      'code{font-family:Courier;background:#f5f5f5;padding:2px 4px;}' +
      'pre{background:#f5f5f5;padding:10px;border:1px solid #ddd;}' +
      'table{border-collapse:collapse;width:100%;}' +
      'th,td{border:1px solid #ddd;padding:8px;}' +
      'th{background:#f5f5f5;font-weight:bold;}</style></head>\n' +
      '<body>' + content.innerHTML + '</body></html>';
    
    if (downloadFile(wordHTML, currentTitle + '.doc', 'application/msword')) {
      showMessage('Word document exported successfully!', 'success');
    }
  }
  
  function exportToHTML() {
    console.log('[Export] HTML export started');
    const content = getContent();
    if (!content) return;
    
    const isDark = document.body.classList.contains('dark-mode');
    const html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n' +
      '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      '<title>' + currentTitle + '</title>\n' +
      '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism' + (isDark ? '-tomorrow' : '') + '.min.css">\n' +
      '<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;' +
      'line-height:1.6;max-width:800px;margin:0 auto;padding:2rem;' +
      'color:' + (isDark ? '#e5e7eb' : '#111827') + ';' +
      'background:' + (isDark ? '#1f2937' : '#ffffff') + ';}' +
      'h1,h2,h3{margin-top:2rem;margin-bottom:1rem;font-weight:600;}' +
      'h1{font-size:2.5rem;}h2{font-size:2rem;}h3{font-size:1.5rem;}' +
      'code{background:' + (isDark ? '#374151' : '#f3f4f6') + ';padding:0.2em 0.4em;border-radius:3px;font-family:Courier;}' +
      'pre{background:' + (isDark ? '#374151' : '#f3f4f6') + ';padding:1rem;border-radius:8px;overflow-x:auto;}' +
      'pre code{background:none;padding:0;}' +
      'table{width:100%;border-collapse:collapse;margin:1rem 0;}' +
      'th,td{border:1px solid ' + (isDark ? '#374151' : '#e5e7eb') + ';padding:0.75rem;text-align:left;}' +
      'th{background:' + (isDark ? '#374151' : '#f9fafb') + ';font-weight:600;}' +
      'img{max-width:100%;height:auto;}' +
      'a{color:#3b82f6;text-decoration:none;}a:hover{text-decoration:underline;}</style>\n' +
      '</head>\n<body>' + content.innerHTML + '\n' +
      '<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>\n' +
      '</body>\n</html>';
    
    if (downloadFile(html, currentTitle + '.html', 'text/html;charset=utf-8')) {
      showMessage('HTML exported successfully!', 'success');
    }
  }
  
  function exportToText() {
    console.log('[Export] Text export started');
    const content = getContent();
    if (!content) return;
    
    const text = content.textContent || content.innerText || '';
    
    if (downloadFile(text, currentTitle + '.txt', 'text/plain;charset=utf-8')) {
      showMessage('Text file exported successfully!', 'success');
    }
  }
  
  function exportToMarkdown() {
    console.log('[Export] Markdown export started');
    
    if (!currentMarkdown) {
      showMessage('No markdown content available. Please load some markdown first.', 'error');
      return;
    }
    
    if (downloadFile(currentMarkdown, currentTitle + '.md', 'text/markdown;charset=utf-8')) {
      showMessage('Markdown exported successfully!', 'success');
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  console.log('[Export] Inline export system loaded');
})();
