const path = require('path');

module.exports = {
  // Cấu hình file Excel
  excel: {
    filePath: path.join(__dirname, '../../excel/MASTERLIST_FV.xlsx'),
    sheetName: 'Masterlist',
    // sheetName: 'HRM_Employees'
    skipRows: 5, // Bỏ qua 5 dòng đầu
    // Cấu hình header
    hasHeaderRow: false, // true nếu file Excel có header row, false nếu không
    // Headers tùy chỉnh khi file không có header row
    customHeaders: [
      'serialNumber',      // Cột A
      'id',         // Cột B
      'fullName',         // Cột C
      'position',    // Cột D
      'department'      // Cột E
    ],
    
    // Mapping giữa headers của Excel và headers trong code (nếu có header row)
    headerMapping: {
        'STT': 'serialNumber',
        'Mã NV': 'id',
      'Họ và tên': 'fullName',
      'Phòng ban': 'department'
    }
  },

  // Cấu hình cửa sổ ứng dụng
  window: {
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600
  },

  // Cấu hình database/validation
  employee: {
    requiredFields: ['fullName', 'id'],
    maxNameLength: 100,
    positions: [
      'Nhân viên',
      'Trưởng phòng', 
      'Quản lý',
      'Giám đốc'
    ],
    departments: [
      'Nhân sự',
      'Kế toán',
      'IT',
      'Marketing',
      'Kinh doanh'
    ],
    statuses: [
      'Đang làm việc',
      'Nghỉ phép',
      'Đã nghỉ việc'
    ]
  },

  // Cấu hình ứng dụng
  app: {
    title: 'Phần Mềm Riêng Của Bé Tuệ Minh',
    version: '1.0.0',
    isDevelopment: process.env.NODE_ENV === 'development'
  }
};