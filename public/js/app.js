/**
 * Employee Manager - Main Frontend Controller
 * Quản lý tất cả logic UI cho nhân viên
 */

class EmployeeManager {
  constructor() {
    this.employees = [];
    this.editingEmployeeId = null;
    this.currentFilters = {};
    this.currentSearchTerm = '';
    this.appConfig = {};
    
    this.init();
  }

  async init() {
    try {
      // Load app config
      const configResult = await employeeService.getAppConfig();
      if (configResult.success) {
        this.appConfig = configResult.data;
        this.populateSelectOptions();
      }

      // Setup event listeners
      this.setupEventListeners();
      
      // Load initial data
      await this.loadEmployees();
      
      Utils.showNotification('Ứng dụng đã sẵn sàng!', 'success');
    } catch (error) {
      console.error('Error initializing app:', error);
      Utils.showNotification('Có lỗi khi khởi tạo ứng dụng!', 'error');
    }
  }

  /**
   * Thiết lập event listeners
   */
  setupEventListeners() {
    // Form submit
    const form = document.getElementById('employeeForm');
    if (form) {
      form.addEventListener('submit', this.handleFormSubmit.bind(this));
    }

    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('keyup', 
        Utils.debounce(this.handleSearch.bind(this), 300)
      );
    }

    // Filters
    this.setupFilterListeners();

    // Buttons
    this.setupButtonListeners();

    // Debug controls
    this.setupDebugEventListeners();
  }

  /**
   * Thiết lập filter listeners
   */
  setupFilterListeners() {
    const filterInputs = ['filterDepartment', 'filterPosition'];
    
    filterInputs.forEach(filterId => {
      const element = document.getElementById(filterId);
      if (element) {
        element.addEventListener('change', this.handleFilter.bind(this));
      }
    });
  }

  /**
   * Thiết lập button listeners
   */
  setupButtonListeners() {
    // Cancel button
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', this.resetForm.bind(this));
    }

    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', this.exportToExcel.bind(this));
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', this.loadEmployees.bind(this));
    }

    // Backup button
    const backupBtn = document.getElementById('backupBtn');
    if (backupBtn) {
      backupBtn.addEventListener('click', this.createBackup.bind(this));
    }
  }

  /**
   * Populate select options từ config
   */
  populateSelectOptions() {
    // Positions
    const positionSelects = ['position', 'filterPosition'];
    positionSelects.forEach(selectId => {
      const select = document.getElementById(selectId);
      if (select && this.appConfig.positions) {
        const currentValue = select.value;
        if (selectId === 'filterPosition') {
          select.innerHTML = '<option value="">Tất cả chức vụ</option>';
        } else {
          select.innerHTML = '<option value="">Chọn chức vụ</option>';
        }
        this.appConfig.positions.forEach(position => {
          const option = document.createElement('option');
          option.value = position;
          option.textContent = position;
          select.appendChild(option);
        });
        select.value = currentValue;
      }
    });

    // Departments
    const departmentSelects = ['department', 'filterDepartment'];
    departmentSelects.forEach(selectId => {
      const select = document.getElementById(selectId);
      if (select && this.appConfig.departments) {
        const currentValue = select.value;
        if (selectId === 'filterDepartment') {
          select.innerHTML = '<option value="">Tất cả phòng ban</option>';
        } else {
          select.innerHTML = '<option value="">Chọn phòng ban</option>';
        }
        this.appConfig.departments.forEach(department => {
          const option = document.createElement('option');
          option.value = department;
          option.textContent = department;
          select.appendChild(option);
        });
        select.value = currentValue;
      }
    });
  }

  /**
   * Load danh sách nhân viên
   */
  async loadEmployees() {
    Utils.showLoading(true);
    
    try {
      const result = await employeeService.getAllEmployees();
      
      if (result.success) {
        this.employees = result.data;
        this.renderEmployeeTable();
        this.updateStatistics();
        Utils.showNotification(`Đã tải ${this.employees.length} nhân viên`, 'success', 2000);
      } else {
        throw new Error(result.error || 'Không thể tải danh sách nhân viên');
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      Utils.showNotification('Không thể tải danh sách nhân viên: ' + error.message, 'error');
    } finally {
      Utils.showLoading(false);
    }
  }

  /**
   * Render bảng nhân viên
   */
  renderEmployeeTable(employeeList = this.employees) {
    const tbody = document.getElementById('employeeTableBody');
    if (!tbody) return;

    if (employeeList.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Chưa có nhân viên nào</td></tr>';
      return;
    }

    tbody.innerHTML = employeeList.map(employee => `
      <tr>
        <td>${employee.serialNumber || ''}</td>
        <td>${Utils.escapeHtml(employee.id || '')}</td>
        <td>${Utils.escapeHtml(employee.fullName)}</td>
        <td>${Utils.escapeHtml(employee.position || '')}</td>
        <td>${Utils.escapeHtml(employee.department || '')}</td>
        <td class="actions">
          <button class="btn btn-warning btn-sm" onclick="employeeManager.editEmployee('${employee.id}')" title="Chỉnh sửa">
            ✏️
          </button>
          <button class="btn btn-danger btn-sm" onclick="employeeManager.deleteEmployee('${employee.id}')" title="Xóa">
            🗑️
          </button>
        </td>
      </tr>
    `).join('');

    this.updateTotalCount(employeeList.length);
  }

  /**
   * Cập nhật số lượng
   */
  updateTotalCount(count = this.employees.length) {
    const totalElement = document.getElementById('totalCount');
    if (totalElement) {
      totalElement.textContent = count;
    }
  }

  /**
   * Cập nhật thống kê
   */
  async updateStatistics() {
    try {
      const result = await employeeService.getStatistics();
      
      if (result.success) {
        const stats = result.data;
        const statsElement = document.getElementById('statisticsBox');
        
        if (statsElement) {
          statsElement.innerHTML = `
            <div class="stats-item">Tổng: <strong>${stats.total}</strong></div>
            <div class="stats-item">IT: <strong>${stats.byDepartment['IT'] || 0}</strong></div>
            <div class="stats-item">Nhân sự: <strong>${stats.byDepartment['Nhân sự'] || 0}</strong></div>
            <div class="stats-item">Marketing: <strong>${stats.byDepartment['Marketing'] || 0}</strong></div>
            <div class="stats-item">Kế toán: <strong>${stats.byDepartment['Kế toán'] || 0}</strong></div>
          `;
        }
      }
    } catch (error) {
      console.error('Error updating statistics:', error);
    }
  }

  /**
   * Handle form submit
   */
  async handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = this.getFormData();
    if (!this.validateFormData(formData)) {
      return;
    }
    
    Utils.showLoading(true);
    
    try {
      let result;
      if (this.editingEmployeeId) {
        result = await employeeService.updateEmployee(this.editingEmployeeId, formData);
      } else {
        result = await employeeService.createEmployee(formData);
      }
      
      if (result.success) {
        Utils.showNotification(
          this.editingEmployeeId ? 'Cập nhật nhân viên thành công!' : 'Thêm nhân viên thành công!',
          'success'
        );
        this.resetForm();
        await this.loadEmployees();
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      Utils.showNotification('Có lỗi xảy ra: ' + error.message, 'error');
    } finally {
      Utils.showLoading(false);
    }
  }

  /**
   * Lấy dữ liệu từ form
   */
  getFormData() {
    return {
      serialNumber: document.getElementById('serialNumber')?.value || null,
      id: document.getElementById('id')?.value.trim() || '',
      fullName: document.getElementById('fullName')?.value.trim() || '',
      position: document.getElementById('position')?.value || '',
      department: document.getElementById('department')?.value || ''
    };
  }

  /**
   * Validate form data
   */
  validateFormData(data) {
    if (!data.fullName) {
      Utils.showNotification('Vui lòng nhập họ và tên!', 'error');
      return false;
    }
    
    if (!data.id) {
      Utils.showNotification('Vui lòng nhập mã nhân viên!', 'error');
      return false;
    }
    
    // Check ID duplicate
    const existingEmployee = this.employees.find(emp => 
      emp.id === data.id && 
      emp.id !== this.editingEmployeeId
    );
    
    if (existingEmployee) {
      Utils.showNotification('Mã nhân viên đã tồn tại!', 'error');
      return false;
    }
    
    return true;
  }

  /**
   * Chỉnh sửa nhân viên
   */
  editEmployee(id) {
    const employee = this.employees.find(emp => emp.id === id);
    if (!employee) {
      Utils.showNotification('Không tìm thấy nhân viên!', 'error');
      return;
    }
    
    this.editingEmployeeId = id;
    
    // Fill form
    document.getElementById('serialNumber').value = employee.serialNumber || '';
    document.getElementById('id').value = employee.id || '';
    document.getElementById('fullName').value = employee.fullName || '';
    document.getElementById('position').value = employee.position || '';
    document.getElementById('department').value = employee.department || '';
    
    // Update UI
    document.getElementById('formTitle').textContent = 'Chỉnh sửa nhân viên';
    document.getElementById('submitBtn').textContent = 'Cập nhật';
    document.getElementById('submitBtn').className = 'btn btn-warning';
    
    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * Xóa nhân viên
   */
  async deleteEmployee(id) {
    const employee = this.employees.find(emp => emp.id === id);
    if (!employee) {
      Utils.showNotification('Không tìm thấy nhân viên!', 'error');
      return;
    }
    
    const confirmed = await Utils.confirm(`Bạn có chắc chắn muốn xóa nhân viên "${employee.fullName}"?`);
    if (!confirmed) return;
    
    Utils.showLoading(true);
    
    try {
      const result = await employeeService.deleteEmployee(id);
      
      if (result.success) {
        Utils.showNotification('Xóa nhân viên thành công!', 'success');
        await this.loadEmployees();
        
        // Reset form if editing this employee
        if (this.editingEmployeeId === id) {
          this.resetForm();
        }
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      Utils.showNotification('Có lỗi xảy ra: ' + error.message, 'error');
    } finally {
      Utils.showLoading(false);
    }
  }

  /**
   * Reset form
   */
  resetForm() {
    this.editingEmployeeId = null;
    
    document.getElementById('employeeForm').reset();
    
    document.getElementById('formTitle').textContent = 'Thêm nhân viên mới';
    document.getElementById('submitBtn').textContent = 'Thêm nhân viên';
    document.getElementById('submitBtn').className = 'btn btn-success';
  }

  /**
   * Handle search
   */
  async handleSearch() {
    const searchInput = document.getElementById('searchInput');
    this.currentSearchTerm = searchInput ? searchInput.value.trim() : '';
    
    await this.applyFiltersAndSearch();
  }

  /**
   * Handle filter
   */
  async handleFilter() {
    this.currentFilters = {
      department: document.getElementById('filterDepartment')?.value || '',
      position: document.getElementById('filterPosition')?.value || ''
    };
    
    await this.applyFiltersAndSearch();
  }

  /**
   * Apply filters and search
   */
  async applyFiltersAndSearch() {
    try {
      let filteredEmployees = [...this.employees];
      
      // Apply search
      if (this.currentSearchTerm) {
        filteredEmployees = filteredEmployees.filter(employee => 
          employee.fullName.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
          (employee.id && employee.id.toString().toLowerCase().includes(this.currentSearchTerm.toLowerCase())) ||
          (employee.position && employee.position.toLowerCase().includes(this.currentSearchTerm.toLowerCase())) ||
          (employee.department && employee.department.toLowerCase().includes(this.currentSearchTerm.toLowerCase()))
        );
      }
      
      // Apply filters
      if (this.currentFilters.department) {
        filteredEmployees = filteredEmployees.filter(emp => emp.department === this.currentFilters.department);
      }
      
      if (this.currentFilters.position) {
        filteredEmployees = filteredEmployees.filter(emp => emp.position === this.currentFilters.position);
      }
      
      this.renderEmployeeTable(filteredEmployees);
    } catch (error) {
      console.error('Error applying filters:', error);
      Utils.showNotification('Có lỗi khi lọc dữ liệu', 'error');
    }
  }

  /**
   * Export to Excel
   */
  async exportToExcel() {
    if (this.employees.length === 0) {
      Utils.showNotification('Không có dữ liệu để xuất!', 'error');
      return;
    }
    
    Utils.showLoading(true);
    
    try {
      const options = {
        filters: this.currentFilters,
        searchTerm: this.currentSearchTerm
      };
      
      const result = await employeeService.exportToExcel(options);
      
      if (result.success && !result.canceled) {
        Utils.showNotification(`Xuất file thành công: ${result.filePath}`, 'success');
      } else if (result.canceled) {
        Utils.showNotification('Đã hủy xuất file', 'info');
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error exporting Excel:', error);
      Utils.showNotification('Có lỗi xảy ra khi xuất file: ' + error.message, 'error');
    } finally {
      Utils.showLoading(false);
    }
  }

  /**
   * Create backup
   */
  async createBackup() {
    Utils.showLoading(true);
    
    try {
      const result = await employeeService.createBackup();
      
      if (result.success) {
        Utils.showNotification(`Tạo backup thành công: ${result.backupPath}`, 'success');
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      Utils.showNotification('Có lỗi xảy ra khi tạo backup: ' + error.message, 'error');
    } finally {
      Utils.showLoading(false);
    }
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterDepartment').value = '';
    document.getElementById('filterPosition').value = '';
    
    this.currentSearchTerm = '';
    this.currentFilters = {};
    
    this.renderEmployeeTable();
  }

  /**
   * Debug: Hiển thị thông tin cấu hình
   */
  async showConfigInfo() {
    try {
      const result = await employeeService.getConfigInfo();
      if (result.success) {
        this.showDebugOutput('Thông tin cấu hình:', JSON.stringify(result.data, null, 2));
      } else {
        this.showDebugOutput('Lỗi:', result.error);
      }
    } catch (error) {
      this.showDebugOutput('Lỗi:', error.message);
    }
  }

  /**
   * Debug: Toggle header mode
   */
  async toggleHeaderMode() {
    try {
      const result = await employeeService.toggleHeaderMode();
      if (result.success) {
        this.showDebugOutput('Toggle Header Mode:', 
          `${result.message}\nChế độ hiện tại: ${result.hasHeaderRow ? 'Có header row' : 'Không có header row'}`);
        // Reload employees to reflect changes
        await this.loadEmployees();
      } else {
        this.showDebugOutput('Lỗi:', result.error);
      }
    } catch (error) {
      this.showDebugOutput('Lỗi:', error.message);
    }
  }

  /**
   * Debug: Tạo file mẫu không có header
   */
  async createSampleFileWithoutHeaders() {
    try {
      const result = await employeeService.createSampleFileWithoutHeaders();
      if (result.success) {
        this.showDebugOutput('Tạo file mẫu không header:', result.message);
        await this.loadEmployees();
      } else {
        this.showDebugOutput('Lỗi:', result.error);
      }
    } catch (error) {
      this.showDebugOutput('Lỗi:', error.message);
    }
  }

  /**
   * Debug: Tạo file mẫu có header
   */
  async createSampleFileWithHeaders() {
    try {
      const result = await employeeService.createSampleFileWithHeaders();
      if (result.success) {
        this.showDebugOutput('Tạo file mẫu có header:', result.message);
        await this.loadEmployees();
      } else {
        this.showDebugOutput('Lỗi:', result.error);
      }
    } catch (error) {
      this.showDebugOutput('Lỗi:', error.message);
    }
  }

  /**
   * Hiển thị output debug
   */
  showDebugOutput(title, content) {
    const debugOutput = document.getElementById('debugOutput');
    if (debugOutput) {
      debugOutput.classList.remove('hidden');
      debugOutput.textContent = `${title}\n\n${content}`;
    }
  }

  /**
   * Setup debug event listeners
   */
  setupDebugEventListeners() {
    // Config info button
    const configInfoBtn = document.getElementById('configInfoBtn');
    if (configInfoBtn) {
      configInfoBtn.addEventListener('click', () => this.showConfigInfo());
    }

    // Toggle header button
    const toggleHeaderBtn = document.getElementById('toggleHeaderBtn');
    if (toggleHeaderBtn) {
      toggleHeaderBtn.addEventListener('click', () => this.toggleHeaderMode());
    }

    // Create sample file without headers
    const createSampleNoHeaderBtn = document.getElementById('createSampleNoHeaderBtn');
    if (createSampleNoHeaderBtn) {
      createSampleNoHeaderBtn.addEventListener('click', () => this.createSampleFileWithoutHeaders());
    }

    // Create sample file with headers
    const createSampleWithHeaderBtn = document.getElementById('createSampleWithHeaderBtn');
    if (createSampleWithHeaderBtn) {
      createSampleWithHeaderBtn.addEventListener('click', () => this.createSampleFileWithHeaders());
    }
  }
}

// Initialize when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  window.employeeManager = new EmployeeManager();
});