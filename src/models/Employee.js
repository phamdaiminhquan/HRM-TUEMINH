/**
 * Employee Model
 * Định nghĩa cấu trúc và validation cho nhân viên
 */

class Employee {
  constructor(data = {}) {
    this.serialNumber = data.serialNumber || null; // STT
    this.id = data.id || null; // Mã NV
    this.fullName = data.fullName || ''; // Họ và tên
    this.position = data.position || ''; // Chức vụ
    this.department = data.department || ''; // Phòng ban
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Validation
  validate() {
    const errors = [];

    if (!this.fullName || this.fullName.trim().length === 0) {
      errors.push('Họ và tên không được để trống');
    }

    if (this.fullName && this.fullName.length > 100) {
      errors.push('Họ và tên không được vượt quá 100 ký tự');
    }

    if (!this.id || this.id.toString().trim().length === 0) {
      errors.push('Mã nhân viên không được để trống');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Kiểm tra email hợp lệ
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Chuyển đổi thành object thuần
  toObject() {
    return {
      serialNumber: this.serialNumber,
      id: this.id,
      fullName: this.fullName.trim(),
      position: this.position,
      department: this.department,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Cập nhật thông tin
  update(data) {
    Object.keys(data).forEach(key => {
      if (this.hasOwnProperty(key) && key !== 'createdAt') {
        this[key] = data[key];
      }
    });
    this.updatedAt = new Date().toISOString();
  }

  // Tạo employee từ object
  static fromObject(obj) {
    return new Employee(obj);
  }

  // Format ngày tháng
  getFormattedDate(field = 'createdAt') {
    const date = this[field];
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN');
  }
}

module.exports = Employee;