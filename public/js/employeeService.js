/**
 * Employee Service - Frontend API Layer
 * Xử lý tất cả các request từ UI đến backend
 */

class EmployeeService {
  /**
   * Lấy tất cả nhân viên
   */
  async getAllEmployees() {
    return await window.electronAPI.invoke('employee:getAll');
  }

  /**
   * Lấy nhân viên theo ID
   */
  async getEmployeeById(id) {
    return await window.electronAPI.invoke('employee:getById', id);
  }

  /**
   * Tạo nhân viên mới
   */
  async createEmployee(employeeData) {
    return await window.electronAPI.invoke('employee:create', employeeData);
  }

  /**
   * Cập nhật nhân viên
   */
  async updateEmployee(id, updateData) {
    return await window.electronAPI.invoke('employee:update', id, updateData);
  }

  /**
   * Xóa nhân viên
   */
  async deleteEmployee(id) {
    return await window.electronAPI.invoke('employee:delete', id);
  }

  /**
   * Tìm kiếm nhân viên
   */
  async searchEmployees(searchTerm) {
    return await window.electronAPI.invoke('employee:search', searchTerm);
  }

  /**
   * Lọc nhân viên
   */
  async filterEmployees(filters) {
    return await window.electronAPI.invoke('employee:filter', filters);
  }

  /**
   * Xuất file Excel
   */
  async exportToExcel(options) {
    return await window.electronAPI.invoke('employee:export', options);
  }

  /**
   * Tạo backup
   */
  async createBackup() {
    return await window.electronAPI.invoke('employee:backup');
  }

  /**
   * Lấy thống kê
   */
  async getStatistics() {
    return await window.electronAPI.invoke('employee:getStatistics');
  }

  /**
   * Lấy cấu hình ứng dụng
   */
  async getAppConfig() {
    return await window.electronAPI.invoke('app:getConfig');
  }

  /**
   * Validate dữ liệu nhân viên
   */
  async validateEmployeeData(employeeData) {
    return await window.electronAPI.invoke('employee:validate', employeeData);
  }

  // Debug APIs

  /**
   * Lấy thông tin cấu hình Excel
   */
  async getConfigInfo() {
    return await window.electronAPI.invoke('employee:getConfigInfo');
  }

  /**
   * Toggle header mode
   */
  async toggleHeaderMode() {
    return await window.electronAPI.invoke('employee:toggleHeaderMode');
  }

  /**
   * Tạo file mẫu không có header
   */
  async createSampleFileWithoutHeaders() {
    return await window.electronAPI.invoke('employee:createSampleWithoutHeaders');
  }

  /**
   * Tạo file mẫu có header
   */
  async createSampleFileWithHeaders() {
    return await window.electronAPI.invoke('employee:createSampleWithHeaders');
  }
}

// Khởi tạo service
window.employeeService = new EmployeeService();