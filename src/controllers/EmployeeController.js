/**
 * Employee Controller
 * Xử lý các request liên quan đến nhân viên
 */

const EmployeeService = require('../services/EmployeeService');

class EmployeeController {
  constructor() {
    this.employeeService = new EmployeeService();
  }

  /**
   * Lấy tất cả nhân viên
   */
  async getAllEmployees(event) {
    try {
      const employees = await this.employeeService.getAllEmployees();
      return {
        success: true,
        data: employees.map(emp => emp.toObject())
      };
    } catch (error) {
      console.error('Error in getAllEmployees:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lấy nhân viên theo ID
   */
  async getEmployeeById(event, id) {
    try {
      const employee = await this.employeeService.getEmployeeById(id);
      
      if (!employee) {
        return {
          success: false,
          error: 'Không tìm thấy nhân viên'
        };
      }

      return {
        success: true,
        data: employee.toObject()
      };
    } catch (error) {
      console.error('Error in getEmployeeById:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Thêm nhân viên mới
   */
  async createEmployee(event, employeeData) {
    try {
      const employee = await this.employeeService.createEmployee(employeeData);
      
      return {
        success: true,
        data: employee.toObject(),
        message: 'Thêm nhân viên thành công'
      };
    } catch (error) {
      console.error('Error in createEmployee:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cập nhật thông tin nhân viên
   */
  async updateEmployee(event, id, updateData) {
    try {
      const employee = await this.employeeService.updateEmployee(id, updateData);
      
      return {
        success: true,
        data: employee.toObject(),
        message: 'Cập nhật nhân viên thành công'
      };
    } catch (error) {
      console.error('Error in updateEmployee:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Xóa nhân viên
   */
  async deleteEmployee(event, id) {
    try {
      await this.employeeService.deleteEmployee(id);
      
      return {
        success: true,
        message: 'Xóa nhân viên thành công'
      };
    } catch (error) {
      console.error('Error in deleteEmployee:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Tìm kiếm nhân viên
   */
  async searchEmployees(event, searchTerm) {
    try {
      const employees = await this.employeeService.searchEmployees(searchTerm);
      
      return {
        success: true,
        data: employees.map(emp => emp.toObject())
      };
    } catch (error) {
      console.error('Error in searchEmployees:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lọc nhân viên
   */
  async filterEmployees(event, filters) {
    try {
      const employees = await this.employeeService.filterEmployees(filters);
      
      return {
        success: true,
        data: employees.map(emp => emp.toObject())
      };
    } catch (error) {
      console.error('Error in filterEmployees:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Xuất Excel
   */
  async exportToExcel(event, options = {}) {
    try {
      const { dialog } = require('electron');
      const { BrowserWindow } = require('electron');

      // Hiển thị dialog lưu file
      const result = await dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
        defaultPath: 'employees.xlsx',
        filters: [
          { name: 'Excel Files', extensions: ['xlsx'] }
        ]
      });

      if (result.canceled) {
        return {
          success: false,
          canceled: true
        };
      }

      // Xuất file Excel
      await this.employeeService.exportToExcel(result.filePath, options);

      return {
        success: true,
        filePath: result.filePath,
        message: 'Xuất file Excel thành công'
      };
    } catch (error) {
      console.error('Error in exportToExcel:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Tạo backup
   */
  async createBackup(event) {
    try {
      const backupPath = await this.employeeService.createBackup();
      
      return {
        success: true,
        backupPath,
        message: 'Tạo backup thành công'
      };
    } catch (error) {
      console.error('Error in createBackup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lấy thống kê
   */
  async getStatistics(event) {
    try {
      const stats = await this.employeeService.getStatistics();
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error in getStatistics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate dữ liệu nhân viên
   */
  validateEmployeeData(event, employeeData) {
    try {
      const Employee = require('../models/Employee');
      const employee = new Employee(employeeData);
      const validation = employee.validate();
      
      return {
        success: true,
        isValid: validation.isValid,
        errors: validation.errors
      };
    } catch (error) {
      console.error('Error in validateEmployeeData:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Tạo file Excel mẫu không có header row
   */
  async createSampleFileWithoutHeaders(event) {
    try {
      const result = await this.employeeService.createSampleFileWithoutHeaders();
      return {
        success: true,
        message: result
      };
    } catch (error) {
      console.error('Error creating sample file without headers:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Tạo file Excel mẫu có header row
   */
  async createSampleFileWithHeaders(event) {
    try {
      const result = await this.employeeService.createSampleFileWithHeaders();
      return {
        success: true,
        message: result
      };
    } catch (error) {
      console.error('Error creating sample file with headers:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Toggle header mode
   */
  async toggleHeaderMode(event) {
    try {
      const newMode = await this.employeeService.toggleHeaderMode();
      return {
        success: true,
        hasHeaderRow: newMode,
        message: `Đã chuyển sang chế độ ${newMode ? 'có header row' : 'không có header row'}`
      };
    } catch (error) {
      console.error('Error toggling header mode:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lấy thông tin cấu hình
   */
  async getConfigInfo(event) {
    try {
      const config = await this.employeeService.getConfigInfo();
      return {
        success: true,
        data: config
      };
    } catch (error) {
      console.error('Error getting config info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lấy danh sách sheets từ file Excel
   */
  async getExcelSheets(event, filePath) {
    try {
      const sheets = await this.employeeService.getExcelSheets(filePath);
      return {
        success: true,
        data: sheets
      };
    } catch (error) {
      console.error('Error getting Excel sheets:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Xem trước dữ liệu Excel với cấu hình
   */
  async previewExcelData(event, config) {
    try {
      const preview = await this.employeeService.previewExcelData(config);
      return {
        success: true,
        data: preview
      };
    } catch (error) {
      console.error('Error previewing Excel data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Đọc dữ liệu Excel với cấu hình tùy chỉnh
   */
  async readExcelWithConfig(event, config) {
    try {
      const result = await this.employeeService.readExcelWithConfig(config);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error reading Excel with config:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = EmployeeController;