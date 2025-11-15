// ===================================
// Export Controller - Multiple Format Support
// ===================================

class ExportController {
  constructor() {
    this.supportedFormats = ['pdf', 'docx', 'html', 'txt', 'rtf'];
    this.currentContent = null;
    this.currentTitle = 'document';
  }

  /**
   * Initialize export functionality
   */
  init() {
    this.setupExportButtons();
    this.librariesLoaded = false;
    this.loadingLibraries = false;
  }

  /**
   * Load required export libraries
   */
  async loadExportLibraries() {
    if (this.librariesLoaded || this.loadingLibraries) {
      return;
    }
    
    this.loadingLibraries = true;
    
    try {
      console.log('[Export] Loading export libraries...');
      
      // Load jsPDF for PDF export
      if (!window.jspdf) {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        console.log('[Export] jsPDF loaded');
      }
      
      // Load html2canvas for PDF rendering
      if (!window.html2canvas) {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        console.log('[Export] html2canvas loaded');
      }
      
      // Load docx library
      if (!window.docx) {
        await this.loadScript('https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.min.js');
        console.log('[Export] docx loaded');
      }
      
      // Load FileSaver for downloads
      if (!window.saveAs) {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js');
        console.log('[Export] FileSaver loaded');
      }
      
      this.librariesLoaded = true;
      console.log('[Export] All export libraries loaded successfully');
    } catch (error) {
      console.error('[Export] Failed to load libraries:', error);
      showToast('Failed to load export libraries. Please refresh the page.', 'error');
    } finally {
      this.loadingLibraries = false;
    }
  }

  /**
   * Load external script
   * @param {string} src - Script source URL
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
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
    document.getElementById('export-pdf')?.addEventListener('click', () => {
      exportMenu?.classList.remove('show');
      this.exportToPDF();
    });
    document.getElementById('export-docx')?.addEventListener('click', () => {
      exportMenu?.classList.remove('show');
      this.exportToWord();
    });
    document.getElementById('export-html')?.addEventListener('click', () => {
      exportMenu?.classList.remove('show');
      this.exportToHTML();
    });
    document.getElementById('export-txt')?.addEventListener('click', () => {
      exportMenu?.classList.remove('show');
      this.exportToText();
    });
    document.getElementById('export-md')?.addEventListener('click', () => {
      exportMenu?.classList.remove('show');
      this.exportToMarkdown();
    });
  }

  /**
   * Update current content for export
   * @param {string} content - HTML content
   * @param {string} title - Document title
   */
  updateContent(content, title = 'document') {
    this.currentContent = content;
    this.currentTitle = this.sanitizeFilename(title);
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
   * Export to PDF with high quality
   */
  async exportToPDF() {
    if (!this.currentContent) {
      showToast('No content to export. Please load some markdown first.', 'error');
      return;
    }

    try {
      showToast('Preparing PDF export...', 'info', 2000);
      
      // Ensure libraries are loaded
      await this.loadExportLibraries();
      
      if (!window.jspdf || !window.html2canvas) {
        throw new Error('Required libraries not loaded');
      }
      
      showToast('Generating PDF...', 'info', 3000);
      
      const { jsPDF } = window.jspdf;
      const content = document.getElementById('markdown-output');
      
      if (!content) {
        throw new Error('Content element not found');
      }

      // Create a clone for export
      const clone = content.cloneNode(true);
      clone.style.width = '210mm'; // A4 width
      clone.style.padding = '20mm';
      clone.style.background = 'white';
      clone.style.color = 'black';
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      document.body.appendChild(clone);

      // Generate canvas from HTML
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(clone);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= pageHeight;
      }

      // Add metadata
      pdf.setProperties({
        title: this.currentTitle,
        subject: 'Markdown Document',
        author: 'Markdown Viewer',
        keywords: 'markdown, export, pdf',
        creator: 'Markdown Viewer Pro'
      });

      // Save PDF
      pdf.save(`${this.currentTitle}.pdf`);
      showToast('PDF exported successfully!', 'success');
      
    } catch (error) {
      console.error('[Export] PDF export failed:', error);
      showToast('Failed to export PDF', 'error');
    }
  }

  /**
   * Export to Word (DOCX) format
   */
  async exportToWord() {
    if (!this.currentContent) {
      showToast('No content to export. Please load some markdown first.', 'error');
      return;
    }

    try {
      showToast('Preparing Word export...', 'info', 2000);
      
      // Ensure libraries are loaded
      await this.loadExportLibraries();
      
      if (!window.docx) {
        throw new Error('Word export library not loaded');
      }
      
      showToast('Generating Word document...', 'info', 3000);
      
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = window.docx;
      
      // Parse HTML content to DOCX structure
      const content = document.getElementById('markdown-output');
      const paragraphs = this.parseHTMLToDocx(content);

      // Create document
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1440,    // 1 inch
                right: 1440,
                bottom: 1440,
                left: 1440
              }
            }
          },
          children: paragraphs
        }]
      });

      // Generate and save
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${this.currentTitle}.docx`);
      
      showToast('Word document exported successfully!', 'success');
      
    } catch (error) {
      console.error('[Export] Word export failed:', error);
      showToast('Failed to export Word document', 'error');
    }
  }

  /**
   * Parse HTML to DOCX paragraphs
   * @param {HTMLElement} element - HTML element to parse
   * @returns {Array} Array of DOCX paragraphs
   */
  parseHTMLToDocx(element) {
    const { Paragraph, TextRun, HeadingLevel } = window.docx;
    const paragraphs = [];
    
    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text) {
          return new TextRun({ text });
        }
        return null;
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();
        
        switch (tagName) {
          case 'h1':
            paragraphs.push(new Paragraph({
              text: node.textContent,
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 240, after: 120 }
            }));
            break;
            
          case 'h2':
            paragraphs.push(new Paragraph({
              text: node.textContent,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            }));
            break;
            
          case 'h3':
            paragraphs.push(new Paragraph({
              text: node.textContent,
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 160, after: 80 }
            }));
            break;
            
          case 'p':
            const runs = [];
            node.childNodes.forEach(child => {
              const run = processNode(child);
              if (run) runs.push(run);
            });
            if (runs.length > 0) {
              paragraphs.push(new Paragraph({
                children: runs,
                spacing: { after: 120 }
              }));
            }
            break;
            
          case 'strong':
          case 'b':
            return new TextRun({
              text: node.textContent,
              bold: true
            });
            
          case 'em':
          case 'i':
            return new TextRun({
              text: node.textContent,
              italics: true
            });
            
          case 'code':
            return new TextRun({
              text: node.textContent,
              font: 'Courier New'
            });
            
          case 'li':
            paragraphs.push(new Paragraph({
              text: `• ${node.textContent}`,
              spacing: { after: 60 }
            }));
            break;
            
          default:
            node.childNodes.forEach(child => processNode(child));
        }
      }
      
      return null;
    };
    
    element.childNodes.forEach(node => processNode(node));
    
    return paragraphs.length > 0 ? paragraphs : [
      new Paragraph({ text: 'No content available' })
    ];
  }

  /**
   * Export to HTML
   */
  async exportToHTML() {
    if (!this.currentContent) {
      showToast('No content to export. Please load some markdown first.', 'error');
      return;
    }

    try {
      // Ensure FileSaver is loaded
      await this.loadExportLibraries();
      
      if (!window.saveAs) {
        throw new Error('FileSaver library not loaded');
      }
      
      const content = document.getElementById('markdown-output');
      const isDarkMode = document.body.classList.contains('dark-mode');
      
      // Create complete HTML document
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
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-markup.min.js"></script>
</body>
</html>`;

      // Create and download
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      saveAs(blob, `${this.currentTitle}.html`);
      
      showToast('HTML exported successfully!', 'success');
      
    } catch (error) {
      console.error('[Export] HTML export failed:', error);
      showToast('Failed to export HTML', 'error');
    }
  }

  /**
   * Export to plain text
   */
  async exportToText() {
    if (!this.currentContent) {
      showToast('No content to export. Please load some markdown first.', 'error');
      return;
    }

    try {
      // Ensure FileSaver is loaded
      await this.loadExportLibraries();
      
      if (!window.saveAs) {
        throw new Error('FileSaver library not loaded');
      }
      
      const content = document.getElementById('markdown-output');
      const text = content.textContent || content.innerText;
      
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `${this.currentTitle}.txt`);
      
      showToast('Text file exported successfully!', 'success');
      
    } catch (error) {
      console.error('[Export] Text export failed:', error);
      showToast('Failed to export text file', 'error');
    }
  }

  /**
   * Export to Markdown
   */
  async exportToMarkdown() {
    try {
      // Ensure FileSaver is loaded
      await this.loadExportLibraries();
      
      if (!window.saveAs) {
        throw new Error('FileSaver library not loaded');
      }
      
      const markdownContent = StorageManager.getLastMarkdown();
      
      if (!markdownContent) {
        showToast('No markdown content available. Please load some markdown first.', 'error');
        return;
      }
      
      const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
      saveAs(blob, `${this.currentTitle}.md`);
      
      showToast('Markdown exported successfully!', 'success');
      
    } catch (error) {
      console.error('[Export] Markdown export failed:', error);
      showToast('Failed to export markdown', 'error');
    }
  }

  /**
   * Print current document
   */
  print() {
    window.print();
  }
}

// Initialize export controller
const exportController = new ExportController();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExportController;
}
