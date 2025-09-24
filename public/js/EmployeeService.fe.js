/**
 * Employee Service - Frontend API Layer
 * Xử lý tất cả các request từ UI đến backend
 */

const { ipcRenderer } = require('electron');

class EmployeeService {
  /**
   * Lấy tất cả nhân viên
   */
  async getAllEmployees() {
    return await ipcRenderer.invoke('employee:getAll');
  }

  /**
   * Lấy nhân viên theo ID
   */
  async getEmployeeById(id) {
    return await ipcRenderer.invoke('employee:getById', id);
  }

  /**
   * Tạo nhân viên mới
   */
  async createEmployee(employeeData) {
    return await ipcRenderer.invoke('employee:create', employeeData);
  }

  /**
   * Cập nhật nhân viên
   */
  async updateEmployee(id, updateData) {
    return await ipcRenderer.invoke('employee:update', id, updateData);
  }

  /**
   * Xóa nhân viên
   */
  async deleteEmployee(id) {
    return await ipcRenderer.invoke('employee:delete', id);
  }

  /**
   * Tìm kiếm nhân viên
   */
  async searchEmployees(searchTerm) {
    return await ipcRenderer.invoke('employee:search', searchTerm);
  }

  /**
   * Lọc nhân viên
   */
  async filterEmployees(filters) {
    return await ipcRenderer.invoke('employee:filter', filters);
  }

  /**
   * Xuất file Excel
   */
  async exportToExcel(options) {
    return await ipcRenderer.invoke('employee:export', options);
  }

  /**
   * Tạo backup
   */
  async createBackup() {
    return await ipcRenderer.invoke('employee:backup');
  }

  /**
   * Lấy thống kê
   */
  async getStatistics() {
    return await ipcRenderer.invoke('employee:statistics');
  }

  /**
   * Lấy cấu hình ứng dụng
   */
  async getAppConfig() {
    return await ipcRenderer.invoke('app:getConfig');
  }

  /**
   * Validate dữ liệu nhân viên
   */
  async validateEmployeeData(employeeData) {
    return await ipcRenderer.invoke('employee:validate', employeeData);
  }

  // Debug APIs

  /**
   * Lấy thông tin cấu hình Excel
   */
  async getConfigInfo() {
    return await ipcRenderer.invoke('employee:getConfigInfo');
  }

  /**
   * Toggle header mode
   */
  async toggleHeaderMode() {
    return await ipcRenderer.invoke('employee:toggleHeaderMode');
  }

  /**
   * Tạo file mẫu không có header
   */
  async createSampleFileWithoutHeaders() {
    return await ipcRenderer.invoke('employee:createSampleWithoutHeaders');
  }

  /**
   * Tạo file mẫu có header
   */
  async createSampleFileWithHeaders() {
    return await ipcRenderer.invoke('employee:createSampleWithHeaders');
  }

  // File Management APIs

  /**
   * Chọn file Excel
   */
  async selectExcelFile() {
    return await ipcRenderer.invoke('file:selectExcel');
  }

  /**
   * Lấy danh sách sheets từ file Excel
   */
  async getExcelSheets(filePath) {
    return await ipcRenderer.invoke('file:getSheets', filePath);
  }

  /**
   * Xem trước dữ liệu Excel
   */
  async previewExcelData(config) {
    return await ipcRenderer.invoke('file:previewData', config);
  }

  /**
   * Đọc dữ liệu Excel với cấu hình
   */
  async readExcelWithConfig(config) {
    return await ipcRenderer.invoke('file:readWithConfig', config);
  }
}

// Khởi tạo service và export cho cả module và window
const employeeServiceInstance = new EmployeeService();

// Export cho module system
if (typeof module !== 'undefined' && module.exports) {
  module.exports = employeeServiceInstance;
}

// Export cho window object (browser)
if (typeof window !== 'undefined') {
  window.employeeService = employeeServiceInstance;
}
