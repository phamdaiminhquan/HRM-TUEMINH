/**
 * Employee Service
 * Xử lý các logic nghiệp vụ liên quan đến nhân viên
 */

const Employee = require('../models/Employee');
const ExcelService = require('./ExcelService');

class EmployeeService {
  constructor() {
    this.excelService = new ExcelService();
  }

  /**
   * Lấy tất cả nhân viên
   * @returns {Array} Danh sách nhân viên
   */
  async getAllEmployees() {
    try {
      const data = this.excelService.readData();
      return data.map(item => Employee.fromObject(item));
    } catch (error) {
      throw new Error(`Không thể lấy danh sách nhân viên: ${error.message}`);
    }
  }

  /**
   * Lấy nhân viên theo ID
   * @param {number} id - ID nhân viên
   * @returns {Employee|null} Thông tin nhân viên
   */
  async getEmployeeById(id) {
    try {
      const employees = await this.getAllEmployees();
      const employee = employees.find(emp => emp.id === id);
      return employee || null;
    } catch (error) {
      throw new Error(`Không thể lấy thông tin nhân viên: ${error.message}`);
    }
  }

  /**
   * Thêm nhân viên mới
   * @param {Object} employeeData - Dữ liệu nhân viên
   * @returns {Employee} Nhân viên đã tạo
   */
  async createEmployee(employeeData) {
    try {
      // Tạo employee object
      const employee = new Employee(employeeData);

      // Validate dữ liệu
      const validation = employee.validate();
      if (!validation.isValid) {
        throw new Error(`Dữ liệu không hợp lệ: ${validation.errors.join(', ')}`);
      }

      // Lấy danh sách hiện tại
      const employees = await this.getAllEmployees();

      // Kiểm tra email trùng lặp
      const emailExists = employees.some(emp => 
        emp.email.toLowerCase() === employee.email.toLowerCase()
      );
      if (emailExists) {
        throw new Error('Email đã tồn tại trong hệ thống');
      }

      // Tạo ID mới
      const maxId = employees.length > 0 ? Math.max(...employees.map(emp => emp.id || 0)) : 0;
      employee.id = maxId + 1;

      // Thêm vào danh sách
      employees.push(employee);

      // Lưu vào Excel
      const dataToSave = employees.map(emp => emp.toObject());
      this.excelService.writeData(dataToSave);

      return employee;
    } catch (error) {
      throw new Error(`Không thể thêm nhân viên: ${error.message}`);
    }
  }

  /**
   * Cập nhật thông tin nhân viên
   * @param {number} id - ID nhân viên
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Employee} Nhân viên đã cập nhật
   */
  async updateEmployee(id, updateData) {
    try {
      const employees = await this.getAllEmployees();
      const employeeIndex = employees.findIndex(emp => emp.id === id);

      if (employeeIndex === -1) {
        throw new Error('Không tìm thấy nhân viên');
      }

      // Cập nhật dữ liệu
      const employee = employees[employeeIndex];
      employee.update(updateData);

      // Validate dữ liệu sau khi cập nhật
      const validation = employee.validate();
      if (!validation.isValid) {
        throw new Error(`Dữ liệu không hợp lệ: ${validation.errors.join(', ')}`);
      }

      // Kiểm tra email trùng lặp (trừ chính nó)
      const emailExists = employees.some(emp => 
        emp.id !== id && emp.email.toLowerCase() === employee.email.toLowerCase()
      );
      if (emailExists) {
        throw new Error('Email đã tồn tại trong hệ thống');
      }

      // Lưu vào Excel
      const dataToSave = employees.map(emp => emp.toObject());
      this.excelService.writeData(dataToSave);

      return employee;
    } catch (error) {
      throw new Error(`Không thể cập nhật nhân viên: ${error.message}`);
    }
  }

  /**
   * Xóa nhân viên
   * @param {number} id - ID nhân viên
   * @returns {boolean} Trạng thái thành công
   */
  async deleteEmployee(id) {
    try {
      const employees = await this.getAllEmployees();
      const initialLength = employees.length;
      
      const filteredEmployees = employees.filter(emp => emp.id !== id);

      if (filteredEmployees.length === initialLength) {
        throw new Error('Không tìm thấy nhân viên để xóa');
      }

      // Lưu vào Excel
      const dataToSave = filteredEmployees.map(emp => emp.toObject());
      this.excelService.writeData(dataToSave);

      return true;
    } catch (error) {
      throw new Error(`Không thể xóa nhân viên: ${error.message}`);
    }
  }

  /**
   * Tìm kiếm nhân viên
   * @param {string} searchTerm - Từ khóa tìm kiếm
   * @returns {Array} Danh sách nhân viên tìm được
   */
  async searchEmployees(searchTerm) {
    try {
      const employees = await this.getAllEmployees();
      
      if (!searchTerm || searchTerm.trim() === '') {
        return employees;
      }

      const term = searchTerm.toLowerCase().trim();
      
      return employees.filter(employee => 
        employee.fullName.toLowerCase().includes(term) ||
        employee.email.toLowerCase().includes(term) ||
        (employee.phone && employee.phone.includes(term)) ||
        (employee.position && employee.position.toLowerCase().includes(term)) ||
        (employee.department && employee.department.toLowerCase().includes(term))
      );
    } catch (error) {
      throw new Error(`Không thể tìm kiếm nhân viên: ${error.message}`);
    }
  }

  /**
   * Lọc nhân viên theo bộ lọc
   * @param {Object} filters - Các bộ lọc
   * @returns {Array} Danh sách nhân viên đã lọc
   */
  async filterEmployees(filters = {}) {
    try {
      const employees = await this.getAllEmployees();
      
      return employees.filter(employee => {
        // Lọc theo phòng ban
        if (filters.department && employee.department !== filters.department) {
          return false;
        }

        // Lọc theo chức vụ
        if (filters.position && employee.position !== filters.position) {
          return false;
        }

        // Lọc theo trạng thái
        if (filters.status && employee.status !== filters.status) {
          return false;
        }

        // Lọc theo khoảng lương
        if (filters.minSalary && employee.salary < filters.minSalary) {
          return false;
        }
        if (filters.maxSalary && employee.salary > filters.maxSalary) {
          return false;
        }

        return true;
      });
    } catch (error) {
      throw new Error(`Không thể lọc nhân viên: ${error.message}`);
    }
  }

  /**
   * Xuất danh sách nhân viên ra Excel
   * @param {string} exportPath - Đường dẫn file xuất
   * @param {Object} options - Tùy chọn xuất
   * @returns {boolean} Trạng thái thành công
   */
  async exportToExcel(exportPath, options = {}) {
    try {
      let employees = await this.getAllEmployees();

      // Áp dụng bộ lọc nếu có
      if (options.filters) {
        employees = await this.filterEmployees(options.filters);
      }

      // Áp dụng tìm kiếm nếu có
      if (options.searchTerm) {
        employees = await this.searchEmployees(options.searchTerm);
      }

      // Chuyển đổi dữ liệu để xuất
      const exportData = employees.map(emp => ({
        'ID': emp.id,
        'Họ và tên': emp.fullName,
        'Email': emp.email,
        'Điện thoại': emp.phone || '',
        'Chức vụ': emp.position || '',
        'Phòng ban': emp.department || '',
        'Lương': emp.salary ? emp.getFormattedSalary() : '',
        'Ngày bắt đầu': emp.startDate || '',
        'Trạng thái': emp.status,
        'Ngày tạo': emp.getFormattedDate('createdAt'),
        'Ngày cập nhật': emp.getFormattedDate('updatedAt')
      }));

      return this.excelService.exportData(exportData, exportPath);
    } catch (error) {
      throw new Error(`Không thể xuất Excel: ${error.message}`);
    }
  }

  /**
   * Tạo backup dữ liệu
   * @returns {string} Đường dẫn file backup
   */
  async createBackup() {
    try {
      return this.excelService.backup();
    } catch (error) {
      throw new Error(`Không thể tạo backup: ${error.message}`);
    }
  }

  /**
   * Lấy thống kê nhân viên
   * @returns {Object} Thống kê
   */
  async getStatistics() {
    try {
      const employees = await this.getAllEmployees();
      
      const stats = {
        total: employees.length,
        byStatus: {},
        byDepartment: {},
        byPosition: {},
        averageSalary: 0,
        totalSalary: 0
      };

      let totalSalary = 0;
      let countWithSalary = 0;

      employees.forEach(emp => {
        // Thống kê theo trạng thái
        stats.byStatus[emp.status] = (stats.byStatus[emp.status] || 0) + 1;

        // Thống kê theo phòng ban
        if (emp.department) {
          stats.byDepartment[emp.department] = (stats.byDepartment[emp.department] || 0) + 1;
        }

        // Thống kê theo chức vụ
        if (emp.position) {
          stats.byPosition[emp.position] = (stats.byPosition[emp.position] || 0) + 1;
        }

        // Tính lương
        if (emp.salary) {
          totalSalary += emp.salary;
          countWithSalary++;
        }
      });

      stats.totalSalary = totalSalary;
      stats.averageSalary = countWithSalary > 0 ? Math.round(totalSalary / countWithSalary) : 0;

      return stats;
    } catch (error) {
      throw new Error(`Không thể lấy thống kê: ${error.message}`);
    }
  }

  /**
   * Tạo file Excel mẫu không có header row
   * @returns {string} Thông báo kết quả
   */
  async createSampleFileWithoutHeaders() {
    try {
      return this.excelService.createSampleFileWithoutHeaders();
    } catch (error) {
      throw new Error(`Không thể tạo file mẫu: ${error.message}`);
    }
  }

  /**
   * Tạo file Excel mẫu có header row
   * @returns {string} Thông báo kết quả
   */
  async createSampleFileWithHeaders() {
    try {
      return this.excelService.createSampleFileWithHeaders();
    } catch (error) {
      throw new Error(`Không thể tạo file mẫu có header: ${error.message}`);
    }
  }

  /**
   * Toggle header mode
   * @returns {boolean} Chế độ mới
   */
  async toggleHeaderMode() {
    try {
      return this.excelService.toggleHeaderMode();
    } catch (error) {
      throw new Error(`Không thể chuyển đổi chế độ header: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin cấu hình
   * @returns {Object} Thông tin cấu hình
   */
  async getConfigInfo() {
    try {
      return this.excelService.getConfigInfo();
    } catch (error) {
      throw new Error(`Không thể lấy thông tin cấu hình: ${error.message}`);
    }
  }
}

module.exports = EmployeeService;