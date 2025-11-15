// ===================================
// Storage Manager
// ===================================

const STORAGE_KEYS = {
  RECENT_FILES: 'markdown_viewer_recent_files',
  SETTINGS: 'markdown_viewer_settings',
  FAVORITES: 'markdown_viewer_favorites',
  THEME: 'markdown_viewer_theme',
  LAST_MARKDOWN: 'markdown_viewer_last_markdown',
  LAST_TITLE: 'markdown_viewer_last_title'
};

const DEFAULT_SETTINGS = {
  theme: 'auto',
  fontSize: 'medium',
  contentWidth: 'medium',
  showLineNumbers: false
};

class StorageManager {
  /**
   * Save recent file
   * @param {Object} file - File metadata
   */
  static saveRecentFile(file) {
    try {
      let recent = this.getRecentFiles();
      
      // Remove duplicate if exists
      recent = recent.filter(f => f.id !== file.id);
      
      // Add to beginning
      recent.unshift({
        id: file.id || generateId(),
        name: file.name,
        content: file.content.substring(0, 1000), // Store preview only
        timestamp: Date.now(),
        source: file.source
      });
      
      // Keep only last 10
      recent = recent.slice(0, 10);
      
      localStorage.setItem(STORAGE_KEYS.RECENT_FILES, JSON.stringify(recent));
    } catch (error) {
      console.error('Failed to save recent file:', error);
      this.handleStorageError(error);
    }
  }
  
  /**
   * Get recent files
   * @returns {Array} Recent files array
   */
  static getRecentFiles() {
    try {
      const recent = localStorage.getItem(STORAGE_KEYS.RECENT_FILES);
      return recent ? JSON.parse(recent) : [];
    } catch (error) {
      console.error('Failed to get recent files:', error);
      return [];
    }
  }
  
  /**
   * Save favorite file
   * @param {Object} file - File metadata
   */
  static saveFavorite(file) {
    try {
      let favorites = this.getFavorites();
      
      // Check if already favorited
      if (favorites.some(f => f.id === file.id)) {
        return;
      }
      
      favorites.push({
        id: file.id || generateId(),
        name: file.name,
        content: file.content,
        timestamp: Date.now(),
        source: file.source
      });
      
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (error) {
      console.error('Failed to save favorite:', error);
      this.handleStorageError(error);
    }
  }
  
  /**
   * Get favorites
   * @returns {Array} Favorites array
   */
  static getFavorites() {
    try {
      const favorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Failed to get favorites:', error);
      return [];
    }
  }
  
  /**
   * Remove favorite
   * @param {string} id - File ID
   */
  static removeFavorite(id) {
    try {
      let favorites = this.getFavorites();
      favorites = favorites.filter(f => f.id !== id);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  }
  
  /**
   * Save settings
   * @param {Object} settings - User settings
   */
  static saveSettings(settings) {
    try {
      const currentSettings = this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.handleStorageError(error);
    }
  }
  
  /**
   * Get settings
   * @returns {Object} User settings
   */
  static getSettings() {
    try {
      const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settings ? { ...DEFAULT_SETTINGS, ...JSON.parse(settings) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return DEFAULT_SETTINGS;
    }
  }
  
  /**
   * Save theme preference
   * @param {string} theme - Theme name (light, dark, auto)
   */
  static saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      // Also save to simple 'theme' key for compatibility with other pages
      localStorage.setItem('theme', theme === 'auto' ? 'light' : theme);
      console.log('[Storage] Theme saved:', theme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }
  
  /**
   * Get theme preference
   * @returns {string} Theme name
   */
  static getTheme() {
    try {
      let theme = localStorage.getItem(STORAGE_KEYS.THEME);
      // Fallback to simple 'theme' key if not found
      if (!theme) {
        theme = localStorage.getItem('theme') || 'auto';
      }
      console.log('[Storage] Theme retrieved:', theme);
      return theme;
    } catch (error) {
      console.error('Failed to get theme:', error);
      return 'auto';
    }
  }
  
  /**
   * Clear all storage
   */
  static clearAll() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
  
  /**
   * Get storage usage
   * @returns {Object} Storage usage info
   */
  static getStorageUsage() {
    try {
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }
      
      // Convert to KB
      const usedKB = (totalSize / 1024).toFixed(2);
      const limitKB = 5120; // 5MB typical limit
      const percentUsed = ((totalSize / (limitKB * 1024)) * 100).toFixed(2);
      
      return {
        used: usedKB,
        limit: limitKB,
        percent: percentUsed
      };
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return { used: 0, limit: 5120, percent: 0 };
    }
  }
  
  /**
   * Handle storage errors
   * @param {Error} error - Storage error
   */
  static handleStorageError(error) {
    if (error.name === 'QuotaExceededError') {
      showToast('Storage quota exceeded. Some features may not work.', 'warning', 5000);
    } else {
      showToast('Storage error occurred. Data may not be saved.', 'error', 5000);
    }
  }
  
  /**
   * Save last markdown content for export
   * @param {string} markdown - Markdown content
   * @param {string} title - Document title
   */
  static saveLastMarkdown(markdown, title = 'document') {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_MARKDOWN, markdown);
      localStorage.setItem(STORAGE_KEYS.LAST_TITLE, title);
    } catch (error) {
      console.error('Failed to save markdown:', error);
    }
  }
  
  /**
   * Get last markdown content
   * @returns {string} Markdown content
   */
  static getLastMarkdown() {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_MARKDOWN) || '';
    } catch (error) {
      console.error('Failed to get markdown:', error);
      return '';
    }
  }
  
  /**
   * Get last document title
   * @returns {string} Document title
   */
  static getLastTitle() {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_TITLE) || 'document';
    } catch (error) {
      console.error('Failed to get title:', error);
      return 'document';
    }
  }
  
  /**
   * Check if storage is available
   * @returns {boolean} True if storage is available
   */
  static isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}
