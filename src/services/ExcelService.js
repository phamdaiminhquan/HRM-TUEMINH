/**
 * Excel Service
 * Xử lý tất cả các thao tác liên quan đến file Excel
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const config = require('../config/app');

class ExcelService {
  constructor() {
    this.filePath = config.excel.filePath;
    this.sheetName = config.excel.sheetName;
  }

  /**
   * Đọc dữ liệu từ file Excel
   * @returns {Array} Mảng dữ liệu nhân viên
   */
  readData() {
    try {
      // Kiểm tra file có tồn tại không
      if (!fs.existsSync(this.filePath)) {
        this.createEmptyFile();
        return [];
      }

      const workbook = XLSX.readFile(this.filePath);
      
      // Kiểm tra sheet có tồn tại không
      if (!workbook.SheetNames.includes(this.sheetName)) {
        this.createSheet(workbook);
        return [];
      }

      const worksheet = workbook.Sheets[this.sheetName];
      
      // Sử dụng phương thức phù hợp dựa trên cấu hình
      let data;
      if (config.excel.hasHeaderRow) {
        data = this.readWithExcelHeaders(worksheet);
      } else {
        data = this.readWithCustomHeaders(worksheet);
      }

      console.log('Worksheet data:', data);
      // Log số lượng bản ghi đọc được
      console.log(`Read ${data.length} records from Excel file.`);

      return data;
    } catch (error) {
      console.error('Error reading Excel file:', error);
      throw new Error(`Không thể đọc file Excel: ${error.message}`);
    }
  }

  /**
   * Đọc dữ liệu với headers từ Excel file
   * @param {Object} worksheet - Worksheet object
   * @returns {Array} Mảng dữ liệu đã được map
   */
  readWithExcelHeaders(worksheet) {
    const data = XLSX.utils.sheet_to_json(worksheet);
    return data.map(row => this.applyHeaderMapping(row));
  }

  /**
   * Đọc dữ liệu với custom headers
   * @param {Object} worksheet - Worksheet object
   * @returns {Array} Mảng dữ liệu với custom headers
   */
  readWithCustomHeaders(worksheet) {
    // Đọc dữ liệu dưới dạng array of arrays
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Nếu không có dữ liệu
    if (rawData.length === 0) {
      return [];
    }

    const customHeaders = config.excel.customHeaders;
    const skipRows = config.excel.skipRows || 0;
    const result = [];

    // Bỏ qua số dòng đầu theo cấu hình
    const dataRows = rawData.slice(skipRows);

    // Chuyển đổi từng row thành object với custom headers
    dataRows.forEach(row => {
      if (row.length === 0) return; // Bỏ qua row trống
      
      const rowData = {};
      customHeaders.forEach((header, index) => {
        rowData[header] = row[index] || '';
      });
      
      // Chỉ thêm row nếu có ít nhất một field không rỗng
      if (Object.values(rowData).some(value => value !== '')) {
        result.push(rowData);
      }
    });

    return result;
  }

  /**
   * Áp dụng header mapping từ Excel headers sang code headers
   * @param {Object} row - Dữ liệu row từ Excel
   * @returns {Object} Row đã được map
   */
  applyHeaderMapping(row) {
    const mapping = config.excel.headerMapping;
    const mappedRow = {};

    Object.keys(row).forEach(excelHeader => {
      const codeHeader = mapping[excelHeader] || excelHeader;
      mappedRow[codeHeader] = row[excelHeader];
    });

    return mappedRow;
  }

  /**
   * Ghi dữ liệu vào file Excel
   * @param {Array} data - Mảng dữ liệu nhân viên
   * @returns {boolean} Trạng thái thành công
   */
  writeData(data) {
    try {
      let workbook;

      // Đọc workbook hiện tại hoặc tạo mới
      if (fs.existsSync(this.filePath)) {
        workbook = XLSX.readFile(this.filePath);
      } else {
        workbook = XLSX.utils.book_new();
      }

      // Tạo worksheet từ dữ liệu
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Thiết lập độ rộng cột
      const columnWidths = [
        { wch: 5 },   // ID
        { wch: 25 },  // Full Name
        { wch: 30 },  // Email
        { wch: 15 },  // Phone
        { wch: 20 },  // Position
        { wch: 15 },  // Department
        { wch: 15 },  // Salary
        { wch: 12 },  // Start Date
        { wch: 15 },  // Status
        { wch: 20 },  // Created At
        { wch: 20 }   // Updated At
      ];
      worksheet['!cols'] = columnWidths;

      // Thêm hoặc thay thế sheet
      if (workbook.SheetNames.includes(this.sheetName)) {
        workbook.Sheets[this.sheetName] = worksheet;
      } else {
        XLSX.utils.book_append_sheet(workbook, worksheet, this.sheetName);
      }

      // Lưu file
      XLSX.writeFile(workbook, this.filePath);
      return true;
    } catch (error) {
      console.error('Error writing Excel file:', error);
      throw new Error(`Không thể ghi file Excel: ${error.message}`);
    }
  }

  /**
   * Xuất dữ liệu ra file Excel mới
   * @param {Array} data - Dữ liệu cần xuất
   * @param {string} exportPath - Đường dẫn file xuất
   * @returns {boolean} Trạng thái thành công
   */
  exportData(data, exportPath) {
    try {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Thiết lập header
      const headers = [
        'ID', 'Họ và tên', 'Email', 'Điện thoại', 'Chức vụ',
        'Phòng ban', 'Lương', 'Ngày bắt đầu', 'Trạng thái',
        'Ngày tạo', 'Ngày cập nhật'
      ];

      // Thêm header vào sheet
      XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });

      // Thiết lập style cho header
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'CCCCCC' } }
        };
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
      XLSX.writeFile(workbook, exportPath);
      return true;
    } catch (error) {
      console.error('Error exporting Excel file:', error);
      throw new Error(`Không thể xuất file Excel: ${error.message}`);
    }
  }

  /**
   * Tạo file Excel rỗng
   */
  createEmptyFile() {
    try {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet([]);
      XLSX.utils.book_append_sheet(workbook, worksheet, this.sheetName);
      XLSX.writeFile(workbook, this.filePath);
    } catch (error) {
      console.error('Error creating empty Excel file:', error);
      throw new Error(`Không thể tạo file Excel: ${error.message}`);
    }
  }

  /**
   * Tạo sheet mới trong workbook hiện có
   * @param {Object} workbook - Workbook hiện tại
   */
  createSheet(workbook) {
    try {
      const worksheet = XLSX.utils.json_to_sheet([]);
      XLSX.utils.book_append_sheet(workbook, worksheet, this.sheetName);
      XLSX.writeFile(workbook, this.filePath);
    } catch (error) {
      console.error('Error creating new sheet:', error);
      throw new Error(`Không thể tạo sheet mới: ${error.message}`);
    }
  }

  /**
   * Backup file Excel
   * @returns {string} Đường dẫn file backup
   */
  backup() {
    try {
      if (!fs.existsSync(this.filePath)) {
        throw new Error('File Excel không tồn tại để backup');
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(
        path.dirname(this.filePath),
        `backup_${timestamp}_${path.basename(this.filePath)}`
      );

      fs.copyFileSync(this.filePath, backupPath);
      return backupPath;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error(`Không thể tạo backup: ${error.message}`);
    }
  }

  /**
   * Tạo file Excel mẫu để test (không có header row)
   * @returns {string} Thông báo thành công
   */
  createSampleFileWithoutHeaders() {
    try {
      // Tạo 5 dòng đầu (metadata hoặc thông tin khác)
      const headerRows = [
        ['DANH SÁCH NHÂN VIÊN CÔNG TY ABC'],
        ['Ngày xuất:', new Date().toLocaleDateString('vi-VN')],
        ['Tổng số nhân viên:', '3'],
        [''],
        ['STT', 'Mã NV', 'Họ và tên', 'Chức vụ', 'Phòng ban'] // Dòng 5: tiêu đề
      ];

      // Data bắt đầu từ dòng 6 (chỉ 5 cột theo config)
      const dataRows = [
        [1, 'NV001', 'Nguyễn Văn A', 'Nhân viên', 'IT'],
        [2, 'NV002', 'Trần Thị B', 'Trưởng phòng', 'Nhân sự'], 
        [3, 'NV003', 'Lê Văn C', 'Nhân viên', 'Marketing']
      ];

      // Kết hợp header rows + data rows
      const allData = [...headerRows, ...dataRows];

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(allData);
      
      XLSX.utils.book_append_sheet(workbook, worksheet, this.sheetName);
      XLSX.writeFile(workbook, this.filePath);
      
      return 'Đã tạo file Excel mẫu không có header row (5 cột, data từ dòng 6)';
    } catch (error) {
      console.error('Error creating sample file:', error);
      throw new Error(`Không thể tạo file mẫu: ${error.message}`);
    }
  }

  /**
   * Tạo file Excel mẫu với header row
   * @returns {string} Thông báo thành công
   */
  createSampleFileWithHeaders() {
    try {
      const headers = ['Họ và tên', 'Email', 'Số điện thoại', 'Phòng ban', 'Chức vụ', 'Ngày bắt đầu', 'Lương', 'Trạng thái'];
      const sampleData = [
        headers,
        ['Nguyễn Văn A', 'a@company.com', '0123456789', 'IT', 'Nhân viên', '2024-01-15', '15000000', 'Đang làm việc'],
        ['Trần Thị B', 'b@company.com', '0987654321', 'Nhân sự', 'Trưởng phòng', '2024-02-01', '20000000', 'Đang làm việc'],
        ['Lê Văn C', 'c@company.com', '0111222333', 'Marketing', 'Nhân viên', '2024-03-10', '12000000', 'Nghỉ phép']
      ];

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
      
      XLSX.utils.book_append_sheet(workbook, worksheet, this.sheetName);
      XLSX.writeFile(workbook, this.filePath);
      
      return 'Đã tạo file Excel mẫu có header row';
    } catch (error) {
      console.error('Error creating sample file with headers:', error);
      throw new Error(`Không thể tạo file mẫu có header: ${error.message}`);
    }
  }

  /**
   * Toggle cấu hình hasHeaderRow
   * @returns {boolean} Giá trị mới của hasHeaderRow
   */
  toggleHeaderMode() {
    config.excel.hasHeaderRow = !config.excel.hasHeaderRow;
    return config.excel.hasHeaderRow;
  }

  /**
   * Lấy thông tin cấu hình hiện tại
   * @returns {Object} Thông tin cấu hình
   */
  getConfigInfo() {
    return {
      hasHeaderRow: config.excel.hasHeaderRow,
      customHeaders: config.excel.customHeaders,
      headerMapping: config.excel.headerMapping,
      filePath: this.filePath,
      sheetName: this.sheetName
    };
  }
}

module.exports = ExcelService;