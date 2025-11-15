// ===================================
// Editor Core - Main Editor Functionality
// ===================================

class EditorCore {
  constructor() {
    this.editor = document.getElementById('markdown-editor');
    this.preview = document.getElementById('preview-content');
    this.lineNumbers = document.getElementById('line-numbers');
    this.cursorPosition = document.getElementById('cursor-position');
    this.saveStatus = document.getElementById('save-status');
    this.saveStatusText = document.getElementById('save-status-text');
    
    this.content = '';
    this.isDirty = false;
    this.autoSaveInterval = null;
    this.updateTimeout = null;
    
    // History for undo/redo
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 50;
  }
  
  init() {
    if (!this.editor || !this.preview) {
      console.error('[Editor] Required elements not found');
      return;
    }
    
    console.log('[Editor] Initializing...');
    
    this.setupEditor();
    this.setupPreview();
    this.setupAutoSave();
    this.loadSavedContent();
    
    console.log('[Editor] Initialized successfully');
  }
  
  setupEditor() {
    // Input event for live preview
    this.editor.addEventListener('input', () => {
      this.isDirty = true;
      this.updateLineNumbers();
      this.updateCursorPosition();
      this.debouncedPreviewUpdate();
      this.debouncedAutoSave();
      this.addToHistory();
    });
    
    // Scroll event
    this.editor.addEventListener('scroll', () => {
      this.syncScroll();
    });
    
    // Selection change
    this.editor.addEventListener('select', () => {
      this.updateCursorPosition();
    });
    
    this.editor.addEventListener('click', () => {
      this.updateCursorPosition();
    });
    
    this.editor.addEventListener('keyup', () => {
      this.updateCursorPosition();
    });
    
    // Tab key handling
    this.editor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        this.insertAtCursor('  ');
      }
    });
    
    // Initial updates
    this.updateLineNumbers();
    this.updateCursorPosition();
  }
  
  setupPreview() {
    // Initial preview
    this.updatePreview();
  }
  
  setupAutoSave() {
    // Auto-save every 30 seconds
    this.autoSaveInterval = setInterval(() => {
      if (this.isDirty) {
        this.saveContent();
      }
    }, 30000);
    
    // Save on page unload
    window.addEventListener('beforeunload', () => {
      if (this.isDirty) {
        this.saveContent();
      }
    });
  }
  
  updateLineNumbers() {
    if (!this.lineNumbers) return;
    
    const lines = this.editor.value.split('\n').length;
    const numbers = [];
    for (let i = 1; i <= lines; i++) {
      numbers.push(i);
    }
    this.lineNumbers.textContent = numbers.join('\n');
  }
  
  updateCursorPosition() {
    if (!this.cursorPosition) return;
    
    const pos = this.editor.selectionStart;
    const text = this.editor.value.substring(0, pos);
    const lines = text.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    
    this.cursorPosition.textContent = `Ln ${line}, Col ${col}`;
  }
  
  debouncedPreviewUpdate() {
    clearTimeout(this.updateTimeout);
    this.updateTimeout = setTimeout(() => {
      this.updatePreview();
    }, 300);
  }
  
  updatePreview() {
    const markdown = this.editor.value;
    
    if (!markdown || markdown.trim() === '') {
      this.preview.innerHTML = `
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect x="8" y="16" width="48" height="32" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M16 24h32M16 32h32M16 40h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p>Preview will appear here</p>
        </div>
      `;
      return;
    }
    
    try {
      // Use marked.js to parse markdown
      const html = marked.parse(markdown);
      
      // Sanitize with DOMPurify
      const clean = DOMPurify.sanitize(html);
      
      this.preview.innerHTML = clean;
      
      // Highlight code blocks
      if (typeof Prism !== 'undefined') {
        this.preview.querySelectorAll('pre code').forEach((block) => {
          Prism.highlightElement(block);
        });
      }
      
      // Trigger SEO analysis
      if (window.editorSEO) {
        window.editorSEO.analyze(markdown);
      }
      
      // Trigger AI analysis
      if (window.editorAI) {
        window.editorAI.analyze(markdown);
      }
      
    } catch (error) {
      console.error('[Editor] Preview update failed:', error);
      this.preview.innerHTML = `<div class="error">Failed to render preview</div>`;
    }
  }
  
  syncScroll() {
    if (!this.preview) return;
    
    const editorScrollPercent = this.editor.scrollTop / (this.editor.scrollHeight - this.editor.clientHeight);
    const previewScrollTop = editorScrollPercent * (this.preview.scrollHeight - this.preview.clientHeight);
    
    this.preview.scrollTop = previewScrollTop;
  }
  
  debouncedAutoSave() {
    clearTimeout(this.autoSaveTimeout);
    this.autoSaveTimeout = setTimeout(() => {
      this.saveContent();
    }, 3000);
  }
  
  saveContent() {
    if (!this.isDirty) return;
    
    try {
      this.setSaveStatus('saving');
      
      const content = this.editor.value;
      localStorage.setItem('editor-content', content);
      localStorage.setItem('editor-saved-at', new Date().toISOString());
      
      this.isDirty = false;
      this.setSaveStatus('saved');
      
      console.log('[Editor] Content saved');
    } catch (error) {
      console.error('[Editor] Save failed:', error);
      this.setSaveStatus('error');
    }
  }
  
  loadSavedContent() {
    try {
      const saved = localStorage.getItem('editor-content');
      if (saved) {
        this.editor.value = saved;
        this.updateLineNumbers();
        this.updatePreview();
        console.log('[Editor] Loaded saved content');
      }
    } catch (error) {
      console.error('[Editor] Load failed:', error);
    }
  }
  
  setSaveStatus(status) {
    if (!this.saveStatus || !this.saveStatusText) return;
    
    this.saveStatus.className = 'status-indicator';
    
    switch (status) {
      case 'saving':
        this.saveStatus.classList.add('saving');
        this.saveStatusText.textContent = 'Saving...';
        break;
      case 'saved':
        this.saveStatusText.textContent = 'Saved';
        setTimeout(() => {
          this.saveStatusText.textContent = 'Ready';
        }, 2000);
        break;
      case 'error':
        this.saveStatus.classList.add('error');
        this.saveStatusText.textContent = 'Save failed';
        break;
      default:
        this.saveStatusText.textContent = 'Ready';
    }
  }
  
  // Public methods for toolbar
  getValue() {
    return this.editor.value;
  }
  
  setValue(value) {
    this.editor.value = value;
    this.updateLineNumbers();
    this.updatePreview();
    this.isDirty = true;
  }
  
  insertAtCursor(text) {
    const start = this.editor.selectionStart;
    const end = this.editor.selectionEnd;
    const value = this.editor.value;
    
    this.editor.value = value.substring(0, start) + text + value.substring(end);
    this.editor.selectionStart = this.editor.selectionEnd = start + text.length;
    
    this.editor.focus();
    this.updateLineNumbers();
    this.updatePreview();
    this.isDirty = true;
  }
  
  wrapSelection(before, after) {
    const start = this.editor.selectionStart;
    const end = this.editor.selectionEnd;
    const value = this.editor.value;
    const selected = value.substring(start, end);
    
    const newText = before + selected + after;
    this.editor.value = value.substring(0, start) + newText + value.substring(end);
    
    this.editor.selectionStart = start + before.length;
    this.editor.selectionEnd = start + before.length + selected.length;
    
    this.editor.focus();
    this.updateLineNumbers();
    this.updatePreview();
    this.isDirty = true;
  }
  
  getSelection() {
    return {
      start: this.editor.selectionStart,
      end: this.editor.selectionEnd,
      text: this.editor.value.substring(this.editor.selectionStart, this.editor.selectionEnd)
    };
  }
  
  replaceSelection(text) {
    const start = this.editor.selectionStart;
    const end = this.editor.selectionEnd;
    const value = this.editor.value;
    
    this.editor.value = value.substring(0, start) + text + value.substring(end);
    this.editor.selectionStart = this.editor.selectionEnd = start + text.length;
    
    this.editor.focus();
    this.updateLineNumbers();
    this.updatePreview();
    this.isDirty = true;
  }
  
  addToHistory() {
    const content = this.editor.value;
    
    // Don't add if same as last entry
    if (this.history.length > 0 && this.history[this.historyIndex] === content) {
      return;
    }
    
    // Remove any history after current index
    this.history = this.history.slice(0, this.historyIndex + 1);
    
    // Add new entry
    this.history.push(content);
    this.historyIndex++;
    
    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.historyIndex--;
    }
  }
  
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.editor.value = this.history[this.historyIndex];
      this.updateLineNumbers();
      this.updatePreview();
      this.isDirty = true;
    }
  }
  
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.editor.value = this.history[this.historyIndex];
      this.updateLineNumbers();
      this.updatePreview();
      this.isDirty = true;
    }
  }
  
  clear() {
    if (confirm('Are you sure you want to clear all content?')) {
      this.editor.value = '';
      this.updateLineNumbers();
      this.updatePreview();
      this.isDirty = true;
      this.addToHistory();
    }
  }
}

// Make available globally
window.EditorCore = EditorCore;
