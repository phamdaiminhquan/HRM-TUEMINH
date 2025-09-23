/**
 * Validation Utils
 * Các hàm tiện ích cho validation
 */

class ValidationUtils {
  /**
   * Kiểm tra email hợp lệ
   * @param {string} email 
   * @returns {boolean}
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Kiểm tra số điện thoại Việt Nam
   * @param {string} phone 
   * @returns {boolean}
   */
  static isValidVietnamesePhone(phone) {
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Kiểm tra chuỗi không rỗng
   * @param {string} str 
   * @returns {boolean}
   */
  static isNotEmpty(str) {
    return str && str.trim().length > 0;
  }

  /**
   * Kiểm tra độ dài chuỗi
   * @param {string} str 
   * @param {number} min 
   * @param {number} max 
   * @returns {boolean}
   */
  static isValidLength(str, min = 0, max = Infinity) {
    const length = str ? str.trim().length : 0;
    return length >= min && length <= max;
  }

  /**
   * Kiểm tra số dương
   * @param {number} num 
   * @returns {boolean}
   */
  static isPositiveNumber(num) {
    return num && Number.isFinite(num) && num > 0;
  }

  /**
   * Kiểm tra số nguyên dương
   * @param {number} num 
   * @returns {boolean}
   */
  static isPositiveInteger(num) {
    return Number.isInteger(num) && num > 0;
  }

  /**
   * Kiểm tra ngày hợp lệ
   * @param {string} dateString 
   * @returns {boolean}
   */
  static isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  /**
   * Sanitize chuỗi đầu vào
   * @param {string} str 
   * @returns {string}
   */
  static sanitizeString(str) {
    if (!str) return '';
    return str.trim().replace(/\s+/g, ' ');
  }

  /**
   * Normalize email
   * @param {string} email 
   * @returns {string}
   */
  static normalizeEmail(email) {
    if (!email) return '';
    return email.trim().toLowerCase();
  }

  /**
   * Format số điện thoại
   * @param {string} phone 
   * @returns {string}
   */
  static formatPhone(phone) {
    if (!phone) return '';
    return phone.replace(/\s/g, '');
  }
}

module.exports = ValidationUtils;