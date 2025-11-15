// ===================================
// Editor SEO - SEO Analysis
// ===================================

class EditorSEO {
  constructor() {
    this.scoreValue = document.getElementById('seo-score-value');
    this.scoreProgress = document.getElementById('seo-score-progress');
    this.wordCount = document.getElementById('word-count');
    this.readingTime = document.getElementById('reading-time');
    this.readabilityScore = document.getElementById('readability-score');
    this.linkCount = document.getElementById('link-count');
    this.suggestionsList = document.getElementById('seo-suggestions-list');
    
    this.lastAnalysis = null;
    this.analysisTimeout = null;
  }
  
  init() {
    console.log('[SEO] Initializing...');
  }
  
  analyze(content) {
    // Debounce analysis
    clearTimeout(this.analysisTimeout);
    this.analysisTimeout = setTimeout(() => {
      this.performAnalysis(content);
    }, 500);
  }
  
  performAnalysis(content) {
    if (!content || content.trim() === '') {
      this.showEmptyState();
      return;
    }
    
    const analysis = {
      wordCount: this.countWords(content),
      characterCount: content.length,
      readingTime: this.calculateReadingTime(content),
      readability: this.calculateReadability(content),
      headings: this.analyzeHeadings(content),
      links: this.analyzeLinks(content),
      keywords: this.analyzeKeywords(content),
      seoScore: 0
    };
    
    // Calculate overall SEO score
    analysis.seoScore = this.calculateSEOScore(analysis, content);
    
    // Generate suggestions
    analysis.suggestions = this.generateSuggestions(analysis, content);
    
    this.lastAnalysis = analysis;
    this.updateUI(analysis);
  }
  
  countWords(text) {
    // Remove markdown syntax for accurate count
    const cleaned = text
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]+`/g, '') // Remove inline code
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Keep link text only
      .replace(/[#*_~`]/g, '') // Remove markdown symbols
      .trim();
    
    if (!cleaned) return 0;
    
    return cleaned.split(/\s+/).filter(word => word.length > 0).length;
  }
  
  calculateReadingTime(text) {
    const words = this.countWords(text);
    return Math.ceil(words / 200); // 200 words per minute
  }
  
  calculateReadability(text) {
    const words = this.countWords(text);
    if (words < 10) return { score: 0, level: 'N/A' };
    
    const sentences = (text.match(/[.!?]+/g) || []).length || 1;
    const syllables = this.countSyllables(text);
    
    // Flesch Reading Ease
    const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
    
    let level;
    if (clampedScore >= 90) level = 'Very Easy';
    else if (clampedScore >= 80) level = 'Easy';
    else if (clampedScore >= 70) level = 'Fairly Easy';
    else if (clampedScore >= 60) level = 'Standard';
    else if (clampedScore >= 50) level = 'Fairly Difficult';
    else if (clampedScore >= 30) level = 'Difficult';
    else level = 'Very Difficult';
    
    return { score: clampedScore, level };
  }
  
  countSyllables(text) {
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    let count = 0;
    
    words.forEach(word => {
      count += this.syllablesInWord(word);
    });
    
    return count;
  }
  
  syllablesInWord(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }
  
  analyzeHeadings(content) {
    const h1 = (content.match(/^# [^\n]+/gm) || []).length;
    const h2 = (content.match(/^## [^\n]+/gm) || []).length;
    const h3 = (content.match(/^### [^\n]+/gm) || []).length;
    
    return { h1, h2, h3, total: h1 + h2 + h3 };
  }
  
  analyzeLinks(content) {
    const links = content.match(/\[([^\]]+)\]\(([^\)]+)\)/g) || [];
    const internal = links.filter(link => !link.includes('http')).length;
    const external = links.length - internal;
    
    return { total: links.length, internal, external };
  }
  
  analyzeKeywords(content) {
    const words = content.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 4); // Only words longer than 4 chars
    
    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    // Get top 5 keywords
    const sorted = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    return sorted;
  }
  
  calculateSEOScore(analysis, content) {
    let score = 0;
    
    // Word count (20 points)
    if (analysis.wordCount >= 300) score += 20;
    else if (analysis.wordCount >= 150) score += 10;
    else if (analysis.wordCount >= 50) score += 5;
    
    // Headings (25 points)
    if (analysis.headings.h1 === 1) score += 10; // Exactly one H1
    else if (analysis.headings.h1 > 1) score += 5; // Multiple H1s (not ideal)
    
    if (analysis.headings.h2 >= 2) score += 10; // Good H2 structure
    else if (analysis.headings.h2 >= 1) score += 5;
    
    if (analysis.headings.h3 >= 1) score += 5; // Has H3s
    
    // Links (15 points)
    if (analysis.links.total >= 3) score += 15;
    else if (analysis.links.total >= 1) score += 10;
    
    // Readability (20 points)
    if (analysis.readability.score >= 60) score += 20;
    else if (analysis.readability.score >= 50) score += 15;
    else if (analysis.readability.score >= 40) score += 10;
    
    // Content structure (20 points)
    const hasLists = content.includes('- ') || content.includes('1. ');
    const hasCodeBlocks = content.includes('```');
    const hasImages = content.includes('![');
    const hasBlockquotes = content.includes('> ');
    
    if (hasLists) score += 5;
    if (hasCodeBlocks) score += 5;
    if (hasImages) score += 5;
    if (hasBlockquotes) score += 5;
    
    return Math.min(100, score);
  }
  
  generateSuggestions(analysis, content) {
    const suggestions = [];
    
    // Word count
    if (analysis.wordCount < 300) {
      suggestions.push({
        type: 'Content Length',
        priority: 'high',
        message: `Your content has ${analysis.wordCount} words. Aim for at least 300 words for better SEO.`,
        action: 'Add more detailed explanations, examples, or sections.'
      });
    }
    
    // H1 heading
    if (analysis.headings.h1 === 0) {
      suggestions.push({
        type: 'Heading Structure',
        priority: 'high',
        message: 'No H1 heading found. Every document should have exactly one H1.',
        action: 'Add a main heading using # at the start of a line.'
      });
    } else if (analysis.headings.h1 > 1) {
      suggestions.push({
        type: 'Heading Structure',
        priority: 'medium',
        message: `Found ${analysis.headings.h1} H1 headings. Use only one H1 per document.`,
        action: 'Convert extra H1s to H2 or H3 headings.'
      });
    }
    
    // H2 headings
    if (analysis.headings.h2 === 0 && analysis.wordCount > 200) {
      suggestions.push({
        type: 'Heading Structure',
        priority: 'medium',
        message: 'No H2 headings found. Break your content into sections.',
        action: 'Add subheadings using ## to organize your content.'
      });
    }
    
    // Links
    if (analysis.links.total === 0 && analysis.wordCount > 100) {
      suggestions.push({
        type: 'Links',
        priority: 'medium',
        message: 'No links found. Add relevant internal or external links.',
        action: 'Link to related content or authoritative sources.'
      });
    }
    
    // Readability
    if (analysis.readability.score < 50 && analysis.wordCount > 50) {
      suggestions.push({
        type: 'Readability',
        priority: 'medium',
        message: `Readability score is ${analysis.readability.score} (${analysis.readability.level}). Consider simplifying.`,
        action: 'Use shorter sentences and simpler words.'
      });
    }
    
    // Lists
    if (!content.includes('- ') && !content.includes('1. ') && analysis.wordCount > 150) {
      suggestions.push({
        type: 'Formatting',
        priority: 'low',
        message: 'No lists found. Lists improve scannability.',
        action: 'Convert appropriate content into bullet or numbered lists.'
      });
    }
    
    // Images
    if (!content.includes('![') && analysis.wordCount > 200) {
      suggestions.push({
        type: 'Visual Content',
        priority: 'low',
        message: 'No images found. Visual content improves engagement.',
        action: 'Add relevant images, diagrams, or screenshots.'
      });
    }
    
    return suggestions;
  }
  
  updateUI(analysis) {
    // Update score
    if (this.scoreValue) {
      this.scoreValue.textContent = analysis.seoScore;
    }
    
    if (this.scoreProgress) {
      const circumference = 2 * Math.PI * 45;
      const offset = circumference - (analysis.seoScore / 100) * circumference;
      this.scoreProgress.style.strokeDashoffset = offset;
      
      // Color based on score
      if (analysis.seoScore >= 80) {
        this.scoreProgress.style.stroke = '#10b981';
      } else if (analysis.seoScore >= 60) {
        this.scoreProgress.style.stroke = '#f59e0b';
      } else {
        this.scoreProgress.style.stroke = '#ef4444';
      }
    }
    
    // Update metrics
    if (this.wordCount) {
      this.wordCount.textContent = analysis.wordCount;
    }
    
    if (this.readingTime) {
      this.readingTime.textContent = `${analysis.readingTime} min`;
    }
    
    if (this.readabilityScore) {
      this.readabilityScore.textContent = `${analysis.readability.score} (${analysis.readability.level})`;
    }
    
    if (this.linkCount) {
      this.linkCount.textContent = analysis.links.total;
    }
    
    // Update suggestions
    if (this.suggestionsList) {
      if (analysis.suggestions.length === 0) {
        this.suggestionsList.innerHTML = '<p class="empty-state">Great! No major SEO issues found.</p>';
      } else {
        this.suggestionsList.innerHTML = analysis.suggestions.map(s => `
          <div class="suggestion-item priority-${s.priority}">
            <span class="suggestion-type">${s.type}</span>
            <p class="suggestion-message">${s.message}</p>
            <p class="suggestion-action">${s.action}</p>
          </div>
        `).join('');
      }
    }
  }
  
  showEmptyState() {
    if (this.scoreValue) this.scoreValue.textContent = '0';
    if (this.wordCount) this.wordCount.textContent = '0';
    if (this.readingTime) this.readingTime.textContent = '0 min';
    if (this.readabilityScore) this.readabilityScore.textContent = '-';
    if (this.linkCount) this.linkCount.textContent = '0';
    
    if (this.suggestionsList) {
      this.suggestionsList.innerHTML = '<p class="empty-state">Start writing to see SEO suggestions...</p>';
    }
    
    if (this.scoreProgress) {
      this.scoreProgress.style.strokeDashoffset = 283;
    }
  }
}

// Make available globally
window.EditorSEO = EditorSEO;
window.editorSEO = null;
