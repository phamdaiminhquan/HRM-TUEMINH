/**
 * Format Utils
 * Các hàm tiện ích cho định dạng dữ liệu
 */

class FormatUtils {
  /**
   * Format tiền tệ VND
   * @param {number} amount 
   * @returns {string}
   */
  static formatCurrency(amount) {
    if (!amount && amount !== 0) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  /**
   * Format số với phân cách hàng nghìn
   * @param {number} number 
   * @returns {string}
   */
  static formatNumber(number) {
    if (!number && number !== 0) return '';
    return new Intl.NumberFormat('vi-VN').format(number);
  }

  /**
   * Format ngày tháng theo định dạng Việt Nam
   * @param {string|Date} date 
   * @returns {string}
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
   * Format ngày giờ đầy đủ
   * @param {string|Date} date 
   * @returns {string}
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
   * Format số điện thoại
   * @param {string} phone 
   * @returns {string}
   */
  static formatPhoneNumber(phone) {
    if (!phone) return '';
    
    // Xóa tất cả ký tự không phải số
    const cleaned = phone.replace(/\D/g, '');
    
    // Format theo pattern xxx-xxx-xxxx
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    
    return phone;
  }

  /**
   * Viết hoa chữ cái đầu
   * @param {string} str 
   * @returns {string}
   */
  static capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Viết hoa chữ cái đầu mỗi từ
   * @param {string} str 
   * @returns {string}
   */
  static titleCase(str) {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  /**
   * Truncate chuỗi và thêm ...
   * @param {string} str 
   * @param {number} maxLength 
   * @returns {string}
   */
  static truncate(str, maxLength = 50) {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + '...';
  }

  /**
   * Format file size
   * @param {number} bytes 
   * @returns {string}
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format thời gian tương đối (ago)
   * @param {string|Date} date 
   * @returns {string}
   */
  static formatTimeAgo(date) {
    if (!date) return '';
    
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
    
    return `${Math.floor(diffInSeconds / 31536000)} năm trước`;
  }

  /**
   * Format badge cho trạng thái
   * @param {string} status 
   * @returns {Object}
   */
  static getStatusBadge(status) {
    const badges = {
      'Đang làm việc': { color: '#28a745', bg: '#d4edda', text: 'Đang làm việc' },
      'Nghỉ phép': { color: '#ffc107', bg: '#fff3cd', text: 'Nghỉ phép' },
      'Đã nghỉ việc': { color: '#dc3545', bg: '#f8d7da', text: 'Đã nghỉ việc' }
    };
    
    return badges[status] || { color: '#6c757d', bg: '#e2e3e5', text: status };
  }

  /**
   * Chuyển đổi object thành query string
   * @param {Object} obj 
   * @returns {string}
   */
  static objectToQueryString(obj) {
    return Object.keys(obj)
      .filter(key => obj[key] !== null && obj[key] !== undefined && obj[key] !== '')
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
      .join('&');
  }

  /**
   * Parse query string thành object
   * @param {string} queryString 
   * @returns {Object}
   */
  static queryStringToObject(queryString) {
    const params = new URLSearchParams(queryString);
    const result = {};
    
    for (const [key, value] of params) {
      result[key] = value;
    }
    
    return result;
  }
}

module.exports = FormatUtils;