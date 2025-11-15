// ===================================
// Search Module - Real-time Search
// ===================================

class SearchModule {
  constructor() {
    this.matches = [];
    this.currentIndex = -1;
    this.lastQuery = '';
  }
  
  /**
   * Search for text in markdown content (real-time)
   * @param {string} query - Search query
   */
  search(query) {
    const content = document.getElementById('markdown-output');
    const searchCount = document.getElementById('search-count');
    
    if (!content) {
      console.error('Markdown output element not found');
      return;
    }
    
    // Clear previous highlights
    this.clearHighlights();
    
    // Handle empty query
    if (!query || query.trim() === '') {
      if (searchCount) {
        searchCount.textContent = '0 of 0';
        searchCount.classList.remove('has-results', 'no-results');
      }
      this.matches = [];
      this.currentIndex = -1;
      this.lastQuery = '';
      return;
    }
    
    this.lastQuery = query;
    
    // Find all matches
    this.matches = this.findMatches(content, query);
    
    console.log(`Search for "${query}" found ${this.matches.length} matches`);
    
    // Update count and highlight
    if (this.matches.length > 0) {
      this.currentIndex = 0;
      this.highlightMatches();
      this.navigateToMatch(0);
      
      if (searchCount) {
        searchCount.textContent = `1 of ${this.matches.length}`;
        searchCount.classList.add('has-results');
        searchCount.classList.remove('no-results');
      }
    } else {
      if (searchCount) {
        searchCount.textContent = 'No matches';
        searchCount.classList.add('no-results');
        searchCount.classList.remove('has-results');
      }
    }
  }
  
  /**
   * Find all matches in content
   * @param {HTMLElement} content - Content element
   * @param {string} query - Search query
   * @returns {Array} Array of match objects
   */
  findMatches(content, query) {
    const matches = [];
    
    // Simple escape function that won't be modified by IDE
    function escapeForRegex(text) {
      return text.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
    }
    
    const escapedQuery = escapeForRegex(query);
    
    // Get all text content
    const textNodes = this.getTextNodes(content);
    
    // Search in each text node
    textNodes.forEach(node => {
      const text = node.textContent;
      const regex = new RegExp(escapedQuery, 'gi');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          node: node,
          index: match.index,
          length: match[0].length,
          text: match[0]
        });
        
        // Prevent infinite loop
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
      }
    });
    
    return matches;
  }
  
  /**
   * Get all text nodes from element
   * @param {HTMLElement} element - Root element
   * @returns {Array} Array of text nodes
   */
  getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip empty nodes and script/style tags
          if (!node.textContent.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          const parent = node.parentElement;
          if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }
    
    return textNodes;
  }
  
  /**
   * Highlight all matches
   */
  highlightMatches() {
    // Group matches by node
    const matchesByNode = new Map();
    
    this.matches.forEach((match, index) => {
      if (!matchesByNode.has(match.node)) {
        matchesByNode.set(match.node, []);
      }
      matchesByNode.get(match.node).push({ ...match, originalIndex: index });
    });
    
    // Process each node
    matchesByNode.forEach((nodeMatches, node) => {
      const text = node.textContent;
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      
      // Sort by index
      nodeMatches.sort((a, b) => a.index - b.index);
      
      // Build fragment with highlights
      nodeMatches.forEach(match => {
        // Add text before match
        if (match.index > lastIndex) {
          fragment.appendChild(
            document.createTextNode(text.substring(lastIndex, match.index))
          );
        }
        
        // Add highlighted match
        const mark = document.createElement('mark');
        mark.textContent = text.substring(match.index, match.index + match.length);
        mark.dataset.matchIndex = match.originalIndex;
        fragment.appendChild(mark);
        
        // Store reference
        this.matches[match.originalIndex].element = mark;
        
        lastIndex = match.index + match.length;
      });
      
      // Add remaining text
      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
      }
      
      // Replace node
      if (node.parentNode) {
        node.parentNode.replaceChild(fragment, node);
      }
    });
  }
  
  /**
   * Navigate to specific match
   * @param {number} index - Match index
   */
  navigateToMatch(index) {
    if (index < 0 || index >= this.matches.length) return;
    
    // Remove current class from all marks
    document.querySelectorAll('#markdown-output mark.current').forEach(mark => {
      mark.classList.remove('current');
    });
    
    // Add current class to active match
    const match = this.matches[index];
    if (match && match.element) {
      match.element.classList.add('current');
      match.element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
    }
    
    this.currentIndex = index;
    
    // Update count
    const searchCount = document.getElementById('search-count');
    if (searchCount && this.matches.length > 0) {
      searchCount.textContent = `${index + 1} of ${this.matches.length}`;
    }
  }
  
  /**
   * Navigate to next match
   */
  nextMatch() {
    if (this.matches.length === 0) return;
    
    const nextIndex = (this.currentIndex + 1) % this.matches.length;
    this.navigateToMatch(nextIndex);
  }
  
  /**
   * Navigate to previous match
   */
  previousMatch() {
    if (this.matches.length === 0) return;
    
    const prevIndex = (this.currentIndex - 1 + this.matches.length) % this.matches.length;
    this.navigateToMatch(prevIndex);
  }
  
  /**
   * Clear all highlights
   */
  clearHighlights() {
    const marks = document.querySelectorAll('#markdown-output mark');
    marks.forEach(mark => {
      const text = document.createTextNode(mark.textContent);
      if (mark.parentNode) {
        mark.parentNode.replaceChild(text, mark);
      }
    });
    
    // Normalize text nodes to merge adjacent text nodes
    const content = document.getElementById('markdown-output');
    if (content) {
      content.normalize();
    }
  }
}
