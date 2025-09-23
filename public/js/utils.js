/**
 * Utils - Frontend
 * Các hàm tiện ích cho frontend
 */

class Utils {
  /**
   * Format tiền tệ VND
   */
  static formatCurrency(amount) {
    if (!amount && amount !== 0) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  /**
   * Format ngày tháng
   */
  static formatDate(date) {
    if (!date) return '';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Format ngày giờ
   */
  static formatDateTime(date) {
    if (!date) return '';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Lấy màu trạng thái
   */
  static getStatusColor(status) {
    const colors = {
      'Đang làm việc': '#28a745',
      'Nghỉ phép': '#ffc107',
      'Đã nghỉ việc': '#dc3545'
    };
    return colors[status] || '#6c757d';
  }

  /**
   * Lấy class CSS cho trạng thái
   */
  static getStatusClass(status) {
    const classes = {
      'Đang làm việc': 'status-active',
      'Nghỉ phép': 'status-leave',
      'Đã nghỉ việc': 'status-inactive'
    };
    return classes[status] || 'status-active';
  }

  /**
   * Escape HTML
   */
  static escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Truncate text
   */
  static truncate(text, length = 50) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  }

  /**
   * Debounce function
   */
  static debounce(func, wait) {
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
   * Generate ID
   */
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Show notification với auto hide
   */
  static showNotification(message, type = 'info', duration = 5000) {
    const notification = document.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Auto hide
    setTimeout(() => {
      notification.classList.add('hidden');
    }, duration);
  }

  /**
   * Show loading
   */
  static showLoading(show = true) {
    const indicator = document.getElementById('loadingIndicator');
    if (!indicator) return;

    if (show) {
      indicator.classList.remove('hidden');
    } else {
      indicator.classList.add('hidden');
    }
  }

  /**
   * Validate email
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number
   */
  static isValidPhone(phone) {
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Copy to clipboard
   */
  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy text: ', err);
      return false;
    }
  }

  /**
   * Download file
   */
  static downloadFile(content, filename, contentType = 'text/plain') {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(a.href);
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Confirm dialog
   */
  static async confirm(message, title = 'Xác nhận') {
    return new Promise((resolve) => {
      const result = window.confirm(`${title}\n\n${message}`);
      resolve(result);
    });
  }

  /**
   * Sort array by property
   */
  static sortBy(array, property, direction = 'asc') {
    return [...array].sort((a, b) => {
      const aVal = a[property];
      const bVal = b[property];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Filter array by multiple conditions
   */
  static filterBy(array, filters) {
    return array.filter(item => {
      return Object.keys(filters).every(key => {
        const filterValue = filters[key];
        const itemValue = item[key];
        
        if (!filterValue) return true;
        
        if (typeof filterValue === 'string') {
          return itemValue && itemValue.toString().toLowerCase().includes(filterValue.toLowerCase());
        }
        
        return itemValue === filterValue;
      });
    });
  }
}

// Export to global scope
window.Utils = Utils;