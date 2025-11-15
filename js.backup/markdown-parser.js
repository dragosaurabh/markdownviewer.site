// ===================================
// Markdown Renderer
// ===================================

class MarkdownRenderer {
  constructor() {
    this.configureMarked();
  }
  
  /**
   * Configure marked.js options
   */
  configureMarked() {
    if (typeof marked !== 'undefined') {
      marked.setOptions({
        gfm: true,
        breaks: true,
        headerIds: true,
        mangle: false,
        sanitize: false // Using DOMPurify instead
      });
    }
  }
  
  /**
   * Render markdown to HTML
   * @param {string} markdown - Markdown text
   * @returns {string} Rendered HTML
   */
  render(markdown) {
    try {
      if (!markdown || markdown.trim() === '') {
        return '';
      }
      
      // Parse markdown to HTML
      let html = marked.parse(markdown);
      
      // Sanitize HTML
      html = this.sanitizeHTML(html);
      
      return html;
    } catch (error) {
      console.error('Failed to render markdown:', error);
      showToast('Failed to render markdown', 'error');
      return `<div class="error">Failed to render markdown: ${error.message}</div>`;
    }
  }
  
  /**
   * Sanitize HTML using DOMPurify
   * @param {string} html - HTML string
   * @returns {string} Sanitized HTML
   */
  sanitizeHTML(html) {
    if (typeof DOMPurify !== 'undefined') {
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'br', 'hr',
          'strong', 'em', 'del', 'code', 'pre',
          'a', 'img',
          'ul', 'ol', 'li',
          'blockquote',
          'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'input', 'label',
          'div', 'span',
          'kbd', 'mark', 'sub', 'sup',
          'details', 'summary',
          'dl', 'dt', 'dd',
          'abbr'
        ],
        ALLOWED_ATTR: [
          'href', 'src', 'alt', 'title', 'class', 'id',
          'type', 'checked', 'disabled',
          'target', 'rel',
          'loading', 'decoding',
          'colspan', 'rowspan',
          'aria-label', 'aria-hidden',
          'data-language'
        ],
        ALLOW_DATA_ATTR: false
      });
    }
    return html;
  }
  
  /**
   * Process rendered HTML
   * @param {HTMLElement} container - Container element
   */
  processRenderedHTML(container) {
    this.addExternalLinkIcons(container);
    this.processImages(container);
    this.wrapTables(container);
    this.addCopyButtonsToCodeBlocks(container);
    this.highlightCode(container);
  }
  
  /**
   * Add external link icons
   * @param {HTMLElement} container - Container element
   */
  addExternalLinkIcons(container) {
    const links = container.querySelectorAll('a[href]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        const currentDomain = window.location.hostname;
        try {
          const linkDomain = new URL(href).hostname;
          if (linkDomain !== currentDomain) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
          }
        } catch (error) {
          // Invalid URL, skip
        }
      }
    });
  }
  
  /**
   * Process images for lazy loading
   * @param {HTMLElement} container - Container element
   */
  processImages(container) {
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
      
      // Add error handling
      img.addEventListener('error', () => {
        img.alt = `Failed to load image: ${img.src}`;
        img.style.border = '2px dashed var(--color-error)';
        img.style.padding = '1rem';
      });
    });
  }
  
  /**
   * Wrap tables in responsive container
   * @param {HTMLElement} container - Container element
   */
  wrapTables(container) {
    const tables = container.querySelectorAll('table');
    tables.forEach(table => {
      if (!table.parentElement.classList.contains('table-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-wrapper';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
    });
  }
  
  /**
   * Add copy buttons to code blocks
   * @param {HTMLElement} container - Container element
   */
  addCopyButtonsToCodeBlocks(container) {
    const codeBlocks = container.querySelectorAll('pre code');
    codeBlocks.forEach(code => {
      const pre = code.parentElement;
      
      // Check if button already exists
      if (pre.querySelector('.copy-code-btn')) {
        return;
      }
      
      const button = document.createElement('button');
      button.className = 'copy-code-btn';
      button.textContent = 'Copy';
      button.setAttribute('aria-label', 'Copy code to clipboard');
      
      button.addEventListener('click', async () => {
        const codeText = code.textContent;
        const success = await copyToClipboard(codeText);
        
        if (success) {
          button.textContent = 'Copied!';
          button.classList.add('copied');
          setTimeout(() => {
            button.textContent = 'Copy';
            button.classList.remove('copied');
          }, 2000);
        } else {
          button.textContent = 'Failed';
          setTimeout(() => {
            button.textContent = 'Copy';
          }, 2000);
        }
      });
      
      pre.style.position = 'relative';
      pre.appendChild(button);
    });
  }
  
  /**
   * Highlight code blocks using Prism.js
   * @param {HTMLElement} container - Container element
   */
  highlightCode(container) {
    if (typeof Prism !== 'undefined') {
      // Highlight all code blocks
      const codeBlocks = container.querySelectorAll('pre code');
      codeBlocks.forEach(code => {
        Prism.highlightElement(code);
      });
    }
  }
}

// ===================================
// TOC Generator
// ===================================

class TOCGenerator {
  /**
   * Generate table of contents
   * @param {HTMLElement} content - Content element
   * @returns {HTMLElement} TOC element
   */
  static generate(content) {
    const headers = this.extractHeaders(content);
    const tocElement = document.getElementById('table-of-contents');
    
    if (!tocElement) return null;
    
    if (headers.length === 0) {
      tocElement.innerHTML = '<p class="toc-empty">No headers found</p>';
      return tocElement;
    }
    
    const tocHTML = this.createTOCHTML(headers);
    tocElement.innerHTML = tocHTML;
    
    // Setup scroll spy
    this.setupScrollSpy(headers);
    
    return tocElement;
  }
  
  /**
   * Extract headers from content
   * @param {HTMLElement} content - Content element
   * @returns {Array} Array of header objects
   */
  static extractHeaders(content) {
    const headers = [];
    const headingElements = content.querySelectorAll('h1, h2, h3');
    
    headingElements.forEach((heading, index) => {
      const level = parseInt(heading.tagName.substring(1));
      const text = heading.textContent;
      let id = heading.id;
      
      // Generate ID if not present
      if (!id) {
        id = `heading-${index}`;
        heading.id = id;
      }
      
      headers.push({
        id,
        level,
        text,
        element: heading
      });
    });
    
    return headers;
  }
  
  /**
   * Create TOC HTML
   * @param {Array} headers - Array of header objects
   * @returns {string} TOC HTML
   */
  static createTOCHTML(headers) {
    let html = '<ul class="toc-list">';
    
    headers.forEach(header => {
      const className = `toc-item toc-h${header.level}`;
      html += `<li class="${className}"><a href="#${header.id}">${header.text}</a></li>`;
    });
    
    html += '</ul>';
    return html;
  }
  
  /**
   * Setup scroll spy for TOC
   * @param {Array} headers - Array of header objects
   */
  static setupScrollSpy(headers) {
    const tocLinks = document.querySelectorAll('#table-of-contents a');
    
    // Intersection Observer for scroll spy
    const observerOptions = {
      rootMargin: '-80px 0px -80% 0px',
      threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          tocLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, observerOptions);
    
    headers.forEach(header => {
      observer.observe(header.element);
    });
    
    // Smooth scroll on click
    tocLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }
}
