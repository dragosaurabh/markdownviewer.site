// ===================================
// Editor Toolbar - Formatting Actions
// ===================================

class EditorToolbar {
  constructor(editorCore) {
    this.core = editorCore;
    this.modals = {
      link: document.getElementById('link-modal'),
      image: document.getElementById('image-modal'),
      template: document.getElementById('template-modal')
    };
  }
  
  init() {
    console.log('[Toolbar] Initializing...');
    
    this.setupToolbarButtons();
    this.setupKeyboardShortcuts();
    this.setupModals();
    this.setupSidebarToggles();
    
    console.log('[Toolbar] Initialized successfully');
  }
  
  setupToolbarButtons() {
    const buttons = document.querySelectorAll('.toolbar-btn[data-action]');
    
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = btn.dataset.action;
        const data = btn.dataset;
        this.handleAction(action, data);
      });
    });
  }
  
  handleAction(action, data) {
    console.log('[Toolbar] Action:', action);
    
    switch (action) {
      case 'heading':
        this.insertHeading(parseInt(data.level));
        break;
      case 'bold':
        this.core.wrapSelection('**', '**');
        break;
      case 'italic':
        this.core.wrapSelection('*', '*');
        break;
      case 'strikethrough':
        this.core.wrapSelection('~~', '~~');
        break;
      case 'code':
        this.core.wrapSelection('`', '`');
        break;
      case 'link':
        this.showLinkModal();
        break;
      case 'image':
        this.showImageModal();
        break;
      case 'table':
        this.insertTable();
        break;
      case 'code-block':
        this.insertCodeBlock();
        break;
      case 'ul':
        this.insertList('unordered');
        break;
      case 'ol':
        this.insertList('ordered');
        break;
      case 'task':
        this.insertList('task');
        break;
      case 'blockquote':
        this.insertBlockquote();
        break;
      case 'undo':
        this.core.undo();
        break;
      case 'redo':
        this.core.redo();
        break;
      case 'template':
        this.showTemplateModal();
        break;
      default:
        console.warn('[Toolbar] Unknown action:', action);
    }
  }
  
  insertHeading(level) {
    const hashes = '#'.repeat(level);
    const selection = this.core.getSelection();
    
    if (selection.text) {
      this.core.replaceSelection(`${hashes} ${selection.text}`);
    } else {
      this.core.insertAtCursor(`${hashes} Heading ${level}\n`);
    }
  }
  
  insertList(type) {
    const selection = this.core.getSelection();
    let prefix;
    
    switch (type) {
      case 'ordered':
        prefix = '1. ';
        break;
      case 'task':
        prefix = '- [ ] ';
        break;
      default:
        prefix = '- ';
    }
    
    if (selection.text) {
      const lines = selection.text.split('\n');
      const formatted = lines.map((line, i) => {
        if (type === 'ordered') {
          return `${i + 1}. ${line}`;
        } else {
          return `${prefix}${line}`;
        }
      }).join('\n');
      this.core.replaceSelection(formatted);
    } else {
      this.core.insertAtCursor(`${prefix}List item\n`);
    }
  }
  
  insertBlockquote() {
    const selection = this.core.getSelection();
    
    if (selection.text) {
      const lines = selection.text.split('\n');
      const formatted = lines.map(line => `> ${line}`).join('\n');
      this.core.replaceSelection(formatted);
    } else {
      this.core.insertAtCursor('> Blockquote\n');
    }
  }
  
  insertTable() {
    const table = `| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

`;
    this.core.insertAtCursor(table);
  }
  
  insertCodeBlock() {
    const selection = this.core.getSelection();
    
    if (selection.text) {
      this.core.replaceSelection(`\`\`\`javascript\n${selection.text}\n\`\`\`\n`);
    } else {
      this.core.insertAtCursor('```javascript\n// Your code here\n```\n');
    }
  }
  
  showLinkModal() {
    const modal = this.modals.link;
    if (!modal) return;
    
    const selection = this.core.getSelection();
    const linkText = document.getElementById('link-text');
    const linkUrl = document.getElementById('link-url');
    
    if (linkText && selection.text) {
      linkText.value = selection.text;
    }
    
    modal.classList.add('show');
    if (linkText) linkText.focus();
  }
  
  showImageModal() {
    const modal = this.modals.image;
    if (!modal) return;
    
    modal.classList.add('show');
    const imageAlt = document.getElementById('image-alt');
    if (imageAlt) imageAlt.focus();
  }
  
  showTemplateModal() {
    const modal = this.modals.template;
    if (!modal) return;
    
    // Load templates
    if (window.editorTemplates) {
      window.editorTemplates.loadTemplateGrid();
    }
    
    modal.classList.add('show');
  }
  
  setupModals() {
    // Close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeAllModals();
      });
    });
    
    // Overlay clicks
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', () => {
        this.closeAllModals();
      });
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
    
    // Link insert
    const insertLinkBtn = document.getElementById('insert-link-btn');
    if (insertLinkBtn) {
      insertLinkBtn.addEventListener('click', () => {
        this.insertLink();
      });
    }
    
    // Image insert
    const insertImageBtn = document.getElementById('insert-image-btn');
    if (insertImageBtn) {
      insertImageBtn.addEventListener('click', () => {
        this.insertImage();
      });
    }
  }
  
  insertLink() {
    const linkText = document.getElementById('link-text');
    const linkUrl = document.getElementById('link-url');
    
    if (!linkText || !linkUrl) return;
    
    const text = linkText.value || 'Link text';
    const url = linkUrl.value || 'https://example.com';
    
    this.core.insertAtCursor(`[${text}](${url})`);
    
    linkText.value = '';
    linkUrl.value = '';
    this.closeAllModals();
  }
  
  insertImage() {
    const imageAlt = document.getElementById('image-alt');
    const imageUrl = document.getElementById('image-url');
    
    if (!imageAlt || !imageUrl) return;
    
    const alt = imageAlt.value || 'Image description';
    const url = imageUrl.value || 'https://example.com/image.jpg';
    
    this.core.insertAtCursor(`![${alt}](${url})\n`);
    
    imageAlt.value = '';
    imageUrl.value = '';
    this.closeAllModals();
  }
  
  closeAllModals() {
    Object.values(this.modals).forEach(modal => {
      if (modal) modal.classList.remove('show');
    });
  }
  
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Check for Ctrl/Cmd key
      const modifier = e.ctrlKey || e.metaKey;
      
      if (!modifier) return;
      
      switch (e.key) {
        case 'b':
          e.preventDefault();
          this.core.wrapSelection('**', '**');
          break;
        case 'i':
          e.preventDefault();
          this.core.wrapSelection('*', '*');
          break;
        case 'k':
          e.preventDefault();
          this.showLinkModal();
          break;
        case '`':
          e.preventDefault();
          this.core.wrapSelection('`', '`');
          break;
        case 'z':
          if (!e.shiftKey) {
            e.preventDefault();
            this.core.undo();
          }
          break;
        case 'y':
          e.preventDefault();
          this.core.redo();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          e.preventDefault();
          this.insertHeading(parseInt(e.key));
          break;
      }
    });
  }
  
  setupSidebarToggles() {
    const seoPanel = document.getElementById('seo-panel');
    const aiPanel = document.getElementById('ai-panel');
    const toggleSeoBtn = document.getElementById('toggle-seo-panel');
    const toggleAiBtn = document.getElementById('toggle-ai-panel');
    
    if (toggleSeoBtn && seoPanel) {
      toggleSeoBtn.addEventListener('click', () => {
        seoPanel.classList.toggle('collapsed');
      });
      
      const seoClose = seoPanel.querySelector('.sidebar-close');
      if (seoClose) {
        seoClose.addEventListener('click', () => {
          seoPanel.classList.add('collapsed');
        });
      }
    }
    
    if (toggleAiBtn && aiPanel) {
      toggleAiBtn.addEventListener('click', () => {
        aiPanel.classList.toggle('collapsed');
      });
      
      const aiClose = aiPanel.querySelector('.sidebar-close');
      if (aiClose) {
        aiClose.addEventListener('click', () => {
          aiPanel.classList.add('collapsed');
        });
      }
    }
    
    // Mobile tabs
    const editorTabs = document.querySelectorAll('.editor-tab');
    const editorPane = document.getElementById('editor-pane');
    const previewPane = document.getElementById('preview-pane');
    
    editorTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        editorTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        
        if (tabName === 'editor') {
          if (editorPane) editorPane.style.display = 'flex';
          if (previewPane) previewPane.style.display = 'none';
        } else {
          if (editorPane) editorPane.style.display = 'none';
          if (previewPane) previewPane.style.display = 'flex';
        }
      });
    });
  }
}

// Make available globally
window.EditorToolbar = EditorToolbar;
