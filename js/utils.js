// ===================================
// Utility Functions
// ===================================

/**
 * Debounce function to limit function execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
function generateId() {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sanitize filename for download
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(filename) {
  return filename.replace(/[^a-z0-9]/gi, '-').toLowerCase();
}

/**
 * Format timestamp to readable date
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date string
 */
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Calculate reading time for text
 * @param {string} text - Text content
 * @returns {number} Reading time in minutes
 */
function calculateReadingTime(text) {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

/**
 * Show error message in element
 * @param {string} elementId - ID of error message element
 * @param {string} message - Error message
 */
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (!errorElement) return;
  
  errorElement.textContent = message;
  errorElement.classList.add('show');
}

/**
 * Hide error message
 * @param {string} elementId - ID of error message element
 */
function hideError(elementId) {
  const errorElement = document.getElementById(elementId);
  if (!errorElement) return;
  
  errorElement.textContent = '';
  errorElement.classList.remove('show');
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
function isValidURL(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Download file
 * @param {string} content - File content
 * @param {string} filename - Filename
 * @param {string} mimeType - MIME type
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Encode text to base64
 * @param {string} text - Text to encode
 * @returns {string} Base64 encoded string
 */
function encodeBase64(text) {
  return btoa(unescape(encodeURIComponent(text)));
}

/**
 * Decode base64 to text
 * @param {string} base64 - Base64 string
 * @returns {string} Decoded text
 */
function decodeBase64(base64) {
  try {
    return decodeURIComponent(escape(atob(base64)));
  } catch (error) {
    console.error('Failed to decode base64:', error);
    return '';
  }
}

/**
 * Get query parameter from URL
 * @param {string} param - Parameter name
 * @returns {string|null} Parameter value
 */
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Set query parameter in URL
 * @param {string} param - Parameter name
 * @param {string} value - Parameter value
 */
function setQueryParam(param, value) {
  const url = new URL(window.location);
  url.searchParams.set(param, value);
  window.history.pushState({}, '', url);
}

/**
 * Slugify text for IDs
 * @param {string} text - Text to slugify
 * @returns {string} Slugified text
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}


/**
 * Convert GitHub URL to raw content URL
 * @param {string} url - GitHub URL
 * @returns {string} Raw content URL
 */
function convertGitHubToRaw(url) {
  if (!url.includes('github.com')) {
    return url;
  }
  
  // Already a raw URL
  if (url.includes('raw.githubusercontent.com')) {
    return url;
  }
  
  // Convert github.com/user/repo/blob/branch/file to raw.githubusercontent.com/user/repo/branch/file
  return url
    .replace('github.com', 'raw.githubusercontent.com')
    .replace('/blob/', '/');
}

/**
 * Get better error message for URL fetch failures
 * @param {string} url - The URL that failed
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
function getURLErrorMessage(url, error) {
  if (error.name === 'AbortError') {
    return 'Request timed out. The server took too long to respond.';
  }

  // For GitHub URLs, only suggest using raw URL if it's not already a raw URL
  if (url.includes('github.com') && !url.includes('raw.githubusercontent.com')) {
    return 'Failed to load from GitHub. Try using the "Raw" button URL (raw.githubusercontent.com) instead.';
  }

  // If it's already a raw GitHub URL that failed
  if (url.includes('raw.githubusercontent.com')) {
    return 'Failed to load from GitHub. Please check if the file exists and is publicly accessible.';
  }

  if (error.message && error.message.includes('CORS')) {
    return 'This URL does not allow cross-origin requests. Try downloading the file and uploading it instead.';
  }

  if (error.message && error.message.includes('404')) {
    return 'File not found (404). Please check the URL and try again.';
  }

  if (error.message && error.message.includes('403')) {
    return 'Access forbidden (403). The file may be private or require authentication.';
  }

  return error.message || 'Failed to load from URL. Please check the URL and try again.';
}
