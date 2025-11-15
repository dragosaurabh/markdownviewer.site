// ===================================
// Editor AI - AI Assistant
// ===================================

class EditorAI {
  constructor() {
    this.scoreValue = document.getElementById('ai-score-value');
    this.suggestionsList = document.getElementById('ai-suggestions-list');
    this.analyzeBtn = document.getElementById('analyze-content');
    
    this.lastAnalysis = null;
  }
  
  init() {
    console.log('[AI] Initializing...');
    
    if (this.analyzeBtn) {
      this.analyzeBtn.addEventListener('click', () => {
        const content = window.editorCore ? window.editorCore.getValue() : '';
        this.performDeepAnalysis(content);
      });
    }
  }
  
  analyze(content) {
    // Quick analysis
    if (!content || content.trim() === '') {
      this.showEmptyState();
      return;
    }
    
    const score = this.calculateAIReadability(content);
    this.updateScore(score);
  }
  
  calculateAIReadability(content) {
    let score = 0;
    const maxScore = 100;
    
    // Structure (30 points)
    const hasIntro = this.detectIntroduction(content);
    const hasConclusion = this.detectConclusion(content);
    const hasSections = (content.match(/^##/gm) || []).length >= 2;
    
    if (hasIntro) score += 10;
    if (hasConclusion) score += 10;
    if (hasSections) score += 10;
    
    // Clarity (30 points)
    const avgSentenceLength = this.getAverageSentenceLength(content);
    if (avgSentenceLength < 20) score += 15;
    else if (avgSentenceLength < 30) score += 10;
    else if (avgSentenceLength < 40) score += 5;
    
    const hasLists = content.includes('- ') || content.includes('1. ');
    if (hasLists) score += 15;
    
    // Semantic richness (20 points)
    const hasCodeExamples = content.includes('```');
    const hasImages = content.includes('![');
    const hasTables = content.includes('|');
    const hasBlockquotes = content.includes('> ');
    
    if (hasCodeExamples) score += 5;
    if (hasImages) score += 5;
    if (hasTables) score += 5;
    if (hasBlockquotes) score += 5;
    
    // Logical flow (20 points)
    const headingHierarchy = this.checkHeadingHierarchy(content);
    if (headingHierarchy) score += 20;
    else score += 10;
    
    return Math.min(maxScore, score);
  }
  
  detectIntroduction(content) {
    const lines = content.split('\n').filter(l => l.trim());
    if (lines.length < 3) return false;
    
    // Check if first few paragraphs are substantial
    const firstParagraphs = lines.slice(0, 5).join(' ');
    return firstParagraphs.length > 100;
  }
  
  detectConclusion(content) {
    const lines = content.split('\n').filter(l => l.trim());
    if (lines.length < 3) return false;
    
    // Check for conclusion keywords
    const lastParagraphs = lines.slice(-5).join(' ').toLowerCase();
    const conclusionKeywords = ['conclusion', 'summary', 'in summary', 'to conclude', 'finally', 'in conclusion'];
    
    return conclusionKeywords.some(keyword => lastParagraphs.includes(keyword));
  }
  
  getAverageSentenceLength(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 0;
    
    const totalWords = sentences.reduce((sum, sentence) => {
      return sum + sentence.trim().split(/\s+/).length;
    }, 0);
    
    return totalWords / sentences.length;
  }
  
  checkHeadingHierarchy(content) {
    const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
    if (headings.length === 0) return true;
    
    let lastLevel = 0;
    for (const heading of headings) {
      const level = heading.match(/^#+/)[0].length;
      
      // Check if jump is too large
      if (level - lastLevel > 1) {
        return false;
      }
      
      lastLevel = level;
    }
    
    return true;
  }
  
  performDeepAnalysis(content) {
    if (!content || content.trim() === '') {
      showToast('Please write some content first', 'warning');
      return;
    }
    
    showToast('Analyzing content...', 'info');
    
    const suggestions = [];
    
    // Structure analysis
    if (!this.detectIntroduction(content)) {
      suggestions.push({
        type: 'Structure',
        priority: 'high',
        message: 'No clear introduction detected.',
        action: 'Add an opening paragraph that introduces the topic and sets context.'
      });
    }
    
    if (!this.detectConclusion(content)) {
      suggestions.push({
        type: 'Structure',
        priority: 'medium',
        message: 'No conclusion found.',
        action: 'Add a concluding section that summarizes key points.'
      });
    }
    
    // Clarity analysis
    const avgSentenceLength = this.getAverageSentenceLength(content);
    if (avgSentenceLength > 30) {
      suggestions.push({
        type: 'Clarity',
        priority: 'medium',
        message: `Average sentence length is ${Math.round(avgSentenceLength)} words. Shorter sentences improve clarity.`,
        action: 'Break long sentences into shorter ones.'
      });
    }
    
    // Visual elements
    if (!content.includes('- ') && !content.includes('1. ')) {
      suggestions.push({
        type: 'Formatting',
        priority: 'medium',
        message: 'No lists found. Lists make content more scannable for AI and humans.',
        action: 'Convert appropriate content into bullet or numbered lists.'
      });
    }
    
    if (!content.includes('```')) {
      suggestions.push({
        type: 'Examples',
        priority: 'low',
        message: 'No code examples found.',
        action: 'Add code examples or technical demonstrations if applicable.'
      });
    }
    
    if (!content.includes('![')) {
      suggestions.push({
        type: 'Visual Content',
        priority: 'low',
        message: 'No images found.',
        action: 'Add relevant images, diagrams, or visual aids.'
      });
    }
    
    // Heading hierarchy
    if (!this.checkHeadingHierarchy(content)) {
      suggestions.push({
        type: 'Structure',
        priority: 'high',
        message: 'Heading hierarchy has gaps (e.g., H1 to H3 without H2).',
        action: 'Ensure headings follow a logical hierarchy: H1 → H2 → H3.'
      });
    }
    
    // Update UI
    this.updateSuggestions(suggestions);
    
    if (suggestions.length === 0) {
      showToast('Great! Your content is well-optimized for AI', 'success');
    } else {
      showToast(`Found ${suggestions.length} suggestions for improvement`, 'info');
    }
  }
  
  updateScore(score) {
    if (this.scoreValue) {
      this.scoreValue.textContent = score;
    }
  }
  
  updateSuggestions(suggestions) {
    if (!this.suggestionsList) return;
    
    if (suggestions.length === 0) {
      this.suggestionsList.innerHTML = '<p class="empty-state">Excellent! Your content is well-structured for AI systems.</p>';
    } else {
      this.suggestionsList.innerHTML = suggestions.map(s => `
        <div class="suggestion-item priority-${s.priority}">
          <span class="suggestion-type">${s.type}</span>
          <p class="suggestion-message">${s.message}</p>
          <p class="suggestion-action">${s.action}</p>
        </div>
      `).join('');
    }
  }
  
  showEmptyState() {
    if (this.scoreValue) {
      this.scoreValue.textContent = '-';
    }
    
    if (this.suggestionsList) {
      this.suggestionsList.innerHTML = '<p class="empty-state">AI suggestions will appear here...</p>';
    }
  }
}

// Make available globally
window.EditorAI = EditorAI;
window.editorAI = null;
