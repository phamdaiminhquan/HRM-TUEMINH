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
    this.modalMode = 'add'; // 'add' hoặc 'edit'
    this.currentEmployee = null;
    
    // Alias for employeeService
    this.employeeService = window.employeeService;
    
    this.init();
  }

  async init() {
    try {
      // Load app config
      const configResult = await this.this.employeeService.getAppConfig();
      if (configResult.success) {
        this.appConfig = configResult.data;
        // Don't populate select options yet - wait for user to select file
      }

      // Setup event listeners
      this.setupEventListeners();
      
      // Don't load initial data - user needs to select file first
      
      Utils.showNotification('Giờ bé TM chọn file excel nha!', 'info');
    } catch (error) {
      console.error('Error initializing app:', error);
      Utils.showNotification('Có lỗi khi khởi tạo ứng dụng!' + error.message, 'error');
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

    // Add Employee button
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    if (addEmployeeBtn) {
      addEmployeeBtn.addEventListener('click', this.openAddModal.bind(this));
    }

    // Modal buttons
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
      closeModal.addEventListener('click', this.closeModal.bind(this));
    }

    const cancelModalBtn = document.getElementById('cancelModalBtn');
    if (cancelModalBtn) {
      cancelModalBtn.addEventListener('click', this.closeModal.bind(this));
    }

    const saveEmployeeBtn = document.getElementById('saveEmployeeBtn');
    if (saveEmployeeBtn) {
      saveEmployeeBtn.addEventListener('click', this.saveEmployee.bind(this));
    }

    const deleteEmployeeBtn = document.getElementById('deleteEmployeeBtn');
    if (deleteEmployeeBtn) {
      deleteEmployeeBtn.addEventListener('click', this.deleteEmployeeFromModal.bind(this));
    }

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
      const modal = document.getElementById('employeeModal');
      if (event.target === modal) {
        this.closeModal();
      }
    });

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
      const result = await this.employeeService.getAllEmployees();
      
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
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Chưa có nhân viên nào</td></tr>';
      return;
    }

    tbody.innerHTML = employeeList.map(employee => `
      <tr onclick="employeeManager.openEditModal('${employee.id}')" class="employee-row">
        <td>${employee.serialNumber || ''}</td>
        <td>${Utils.escapeHtml(employee.id || '')}</td>
        <td>${Utils.escapeHtml(employee.fullName)}</td>
        <td>${Utils.escapeHtml(employee.position || '')}</td>
        <td>${Utils.escapeHtml(employee.department || '')}</td>
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
      const result = await this.employeeService.getStatistics();
      
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
        result = await this.employeeService.updateEmployee(this.editingEmployeeId, formData);
      } else {
        result = await this.employeeService.createEmployee(formData);
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
      const result = await this.employeeService.deleteEmployee(id);
      
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
      
      const result = await this.employeeService.exportToExcel(options);
      
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
      const result = await this.employeeService.createBackup();
      
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
      const result = await this.employeeService.getConfigInfo();
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
      const result = await this.employeeService.toggleHeaderMode();
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
      const result = await this.employeeService.createSampleFileWithoutHeaders();
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
      const result = await this.employeeService.createSampleFileWithHeaders();
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

    // File configuration event listeners
    this.setupFileConfigListeners();
  }

  /**
   * Setup file configuration event listeners
   */
  setupFileConfigListeners() {
    // Select file button
    const selectFileBtn = document.getElementById('selectFileBtn');
    if (selectFileBtn) {
      selectFileBtn.addEventListener('click', () => this.selectExcelFile());
    }

    // Load sheets button -> Reload sheets button
    const reloadSheetsBtn = document.getElementById('reloadSheetsBtn');
    if (reloadSheetsBtn) {
      reloadSheetsBtn.addEventListener('click', () => this.loadExcelSheets());
    }

    // Preview data button
    const previewDataBtn = document.getElementById('previewDataBtn');
    if (previewDataBtn) {
      console.log('Adding click listener to previewDataBtn');
      previewDataBtn.addEventListener('click', () => this.previewExcelData());
    } else {
      console.log('previewDataBtn not found!');
    }

    // Read data button
    const readDataBtn = document.getElementById('readDataBtn');
    if (readDataBtn) {
      readDataBtn.addEventListener('click', () => this.readExcelData());
    }

    // Reset file button
    const resetFileBtn = document.getElementById('resetFileBtn');
    if (resetFileBtn) {
      resetFileBtn.addEventListener('click', () => this.resetFileSelection());
    }

    // Sheet select change
    const sheetSelect = document.getElementById('sheetSelect');
    if (sheetSelect) {
      sheetSelect.addEventListener('change', () => this.onSheetSelected());
    }
  }

  /**
   * Chọn file Excel
   */
  async selectExcelFile() {
    try {
      const result = await this.employeeService.selectExcelFile();
      
      if (result.success && result.filePath) {
        document.getElementById('selectedFilePath').value = result.filePath;
        this.selectedFilePath = result.filePath;
        
        // Show sheet selection section
        document.querySelector('.sheet-selection').classList.remove('hidden');
        
        // Tự động load danh sách sheets
        await this.loadExcelSheets();
        
        Utils.showNotification('Yay! bé chọn: ' + result.filePath, 'success');
      } else if (result.canceled) {
        Utils.showNotification('Anh không chọn được file này, huhu', 'info');
      }
    } catch (error) {
      console.error('Error selecting file:', error);
      Utils.showNotification('Lỗi anh, anh vô dụng, anh xin lỗi: ' + error.message, 'error');
    }
  }

  /**
   * Lấy danh sách sheets
   */
  async loadExcelSheets() {
    if (!this.selectedFilePath) {
      Utils.showNotification('Bé chọn file Excel trước nha!', 'error');
      return;
    }

    Utils.showLoading(true);
    
    try {
      const result = await this.employeeService.getExcelSheets(this.selectedFilePath);
      
      if (result.success) {
        const sheetSelect = document.getElementById('sheetSelect');
        sheetSelect.innerHTML = '<option value="">-- Chọn Sheet --</option>';
        
        result.data.forEach(sheetName => {
          const option = document.createElement('option');
          option.value = sheetName;
          option.textContent = sheetName;
          sheetSelect.appendChild(option);
        });
        
        Utils.showNotification(`Đã tải ${result.data.length} sheets`, 'success');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error loading sheets:', error);
      Utils.showNotification('Lỗi anh, anh vô dụng: ' + error.message, 'error');
    } finally {
      Utils.showLoading(false);
    }
  }

  /**
   * Khi chọn sheet
   */
  onSheetSelected() {
    const sheetSelect = document.getElementById('sheetSelect');
    if (sheetSelect.value) {
      document.querySelector('.reading-config').classList.remove('hidden');
      document.getElementById('previewDataBtn').disabled = false;
      document.getElementById('readDataBtn').disabled = false;
    } else {
      document.querySelector('.reading-config').classList.add('hidden');
      document.getElementById('dataPreview').classList.add('hidden');
      document.getElementById('previewDataBtn').disabled = true;
      document.getElementById('readDataBtn').disabled = true;
    }
  }

  /**
   * Lấy cấu hình đọc từ form
   */
  getReadingConfig() {
    return {
      filePath: this.selectedFilePath,
      sheetName: document.getElementById('sheetSelect').value,
      skipRows: parseInt(document.getElementById('skipRows').value) || 0,
      takeRows: parseInt(document.getElementById('takeRows').value) || 0,
    };
  }

  /**
   * Xem trước dữ liệu Excel
   */
  async previewExcelData() {
    const config = this.getReadingConfig();
    
    if (!config.filePath || !config.sheetName) {
      Utils.showNotification('Bé chọn file và sheet trước nha!', 'error');
      return;
    }

    Utils.showLoading(true);
    
    try {
      const result = await this.employeeService.previewExcelData(config);
      
      if (result.success) {
        this.showPreviewData(result.data);
        Utils.showNotification('Cho bé xem trước nè!', 'success');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error previewing data:', error);
      Utils.showNotification('Lỗi anh, anh vô dụng: ' + error.message, 'error');
    } finally {
      Utils.showLoading(false);
    }
  }

  /**
   * Hiển thị preview dữ liệu
   */
  showPreviewData(previewData) {
    const previewDiv = document.getElementById('dataPreview');
    const contentDiv = document.getElementById('previewContent');
    
    let html = `
      <div style="margin-bottom: 15px;">
        <strong>📊 Thống kê:</strong><br>
        • File có ${previewData.totalRows} dòng, ${previewData.totalColumns} cột<br>
        • Hiển thị ${previewData.previewRows} dòng đầu, ${previewData.previewColumns} cột<br>
        • Cấu hình: Skip ${previewData.config.skipRows} dòng, Take ${previewData.config.takeRows || 'tất cả'} dòng
      </div>
    `;
    
    if (previewData.data.length > 0) {
      html += '<table class="preview-table"><thead><tr>';
      
      // Headers
      const maxCols = Math.max(...previewData.data.map(row => row.length));
      for (let i = 0; i < maxCols; i++) {
        html += `<th>Cột ${String.fromCharCode(65 + i)}</th>`;
      }
      html += '</tr></thead><tbody>';
      
      // Data rows
      previewData.data.forEach((row, rowIndex) => {
        html += '<tr>';
        for (let i = 0; i < maxCols; i++) {
          const cellValue = row[i] || '';
          html += `<td>${Utils.escapeHtml(cellValue.toString())}</td>`;
        }
        html += '</tr>';
      });
      
      html += '</tbody></table>';
    } else {
      html += '<p class="text-muted">Không có dữ liệu để hiển thị</p>';
    }
    
    contentDiv.innerHTML = html;
    previewDiv.classList.remove('hidden');
  }

  /**
   * Đọc dữ liệu Excel với cấu hình
   */
  async readExcelData() {
    const config = this.getReadingConfig();
    Utils.showNotification('Anh bắt đầu đọc dữ liệu nè, bé đợi xíu nha!' + config, 'info');
    if (!config.filePath || !config.sheetName) {
      Utils.showNotification('Vui lòng chọn file và sheet!', 'error');
      return;
    }

    Utils.showLoading(true);
    
    try {
      const result = await this.this.employeeService.readExcelWithConfig(config);
      
      if (result.success) {
        this.employees = result.data;
        
        // Show main application content after successful data load
        this.showMainApplication();
        
        // Populate select options now that we have data
        this.populateSelectOptions();
        
        this.renderEmployeeTable();
        this.updateStatistics();
        
        Utils.showNotification(`Anh đọc được ${result.data.length} nhân viên từ Excel`, 'success');
        
        // Ẩn preview và scroll xuống table
        document.getElementById('dataPreview').classList.add('hidden');
        document.querySelector('.table-section').scrollIntoView({ behavior: 'smooth' });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error reading Excel data:', error);
      Utils.showNotification('Lỗi anh, anh vô dụng: ' + error.message, 'error');
    } finally {
      Utils.showLoading(false);
    }
  }

  /**
   * Hiển thị ứng dụng chính sau khi load dữ liệu thành công
   */
  showMainApplication() {
    // Show statistics
    const statisticsBox = document.getElementById('statisticsBox');
    if (statisticsBox) {
      statisticsBox.classList.remove('hidden');
    }
    
    // Show form section (if exists)
    const formSection = document.querySelector('.form-section');
    if (formSection) {
      formSection.classList.remove('hidden');
    }
    
    // Show table section
    const tableSection = document.querySelector('.table-section');
    if (tableSection) {
      tableSection.classList.remove('hidden');
    }
  }

  /**
   * Reset file selection and return to initial state
   */
  resetFileSelection() {
    // Clear current file data
    this.selectedFilePath = '';
    this.employees = [];

    // Reset form fields
    document.getElementById('selectedFilePath').value = '';
    document.getElementById('sheetSelect').innerHTML = '';
    document.getElementById('skipRows').value = '5';
    document.getElementById('takeRows').value = '';
    
    // Clear preview
    const dataPreview = document.getElementById('dataPreview');
    if (dataPreview) {
      dataPreview.classList.add('hidden');
      const previewContent = document.getElementById('previewContent');
      if (previewContent) {
        previewContent.innerHTML = '';
      }
    }

    // Hide dependent sections
    const sheetSelection = document.querySelector('.sheet-selection');
    const readingConfig = document.querySelector('.reading-config');
    if (sheetSelection) sheetSelection.classList.add('hidden');
    if (readingConfig) readingConfig.classList.add('hidden');

    // Hide main application
    this.hideMainApplication();

    // Reset button states
    document.getElementById('loadSheetsBtn').disabled = true;
    document.getElementById('previewDataBtn').disabled = true;
    document.getElementById('readDataBtn').disabled = true;

    Utils.showNotification('Anh dọn dẹp xong rồi, bé chọn file mới nha!', 'info');
  }

  /**
   * Hide main application content
   */
  hideMainApplication() {
    const elementsToHide = ['statisticsBox', 'form-section', 'table-section'];
    elementsToHide.forEach(id => {
      const element = document.getElementById(id) || document.querySelector(`.${id}`);
      if (element) {
        element.classList.add('hidden');
      }
    });
  }

  /**
   * Open modal for adding new employee
   */
  openAddModal() {
    this.modalMode = 'add';
    this.currentEmployee = null;
    
    // Reset form
    document.getElementById('employeeModalForm').reset();
    
    // Update modal title and buttons
    document.getElementById('modalTitle').textContent = 'Bé bấm đây để thêm nhân viên mới nè';
    document.getElementById('saveEmployeeBtn').textContent = '💾 Bấm đây là lưu';
    document.getElementById('deleteEmployeeBtn').style.display = 'none';
    
    // Populate select options
    this.populateModalSelectOptions();
    
    // Show modal
    document.getElementById('employeeModal').style.display = 'block';
  }

  /**
   * Open modal for editing employee
   */
  openEditModal(employeeId) {
    const employee = this.employees.find(emp => emp.id === employeeId);
    if (!employee) {
      Utils.showNotification('Anh không tìm thấy nhân viên, huhu!', 'error');
      return;
    }

    this.modalMode = 'edit';
    this.currentEmployee = employee;
    
    // Fill form with employee data
    document.getElementById('modalId').value = employee.id || '';
    document.getElementById('modalFullName').value = employee.fullName || '';
    document.getElementById('modalPosition').value = employee.position || '';
    document.getElementById('modalDepartment').value = employee.department || '';
    
    // Update modal title and buttons
    document.getElementById('modalTitle').textContent = 'Báo Cáo Bé, Đây Là Chi Tiết Nhân Viên';
    document.getElementById('saveEmployeeBtn').textContent = '💾 Sửa luôn';
    document.getElementById('deleteEmployeeBtn').style.display = 'block';
    
    // Populate select options
    this.populateModalSelectOptions();
    
    // Show modal
    document.getElementById('employeeModal').style.display = 'block';
  }

  /**
   * Close modal
   */
  closeModal() {
    document.getElementById('employeeModal').style.display = 'none';
    this.currentEmployee = null;
    this.modalMode = 'add';
  }

  /**
   * Populate select options in modal
   */
  populateModalSelectOptions() {
    // Positions
    const positionSelect = document.getElementById('modalPosition');
    if (positionSelect && this.appConfig.positions) {
      const currentValue = positionSelect.value;
      positionSelect.innerHTML = '<option value="">Chọn chức vụ</option>';
      this.appConfig.positions.forEach(position => {
        const option = document.createElement('option');
        option.value = position;
        option.textContent = position;
        positionSelect.appendChild(option);
      });
      positionSelect.value = currentValue;
    }

    // Departments
    const departmentSelect = document.getElementById('modalDepartment');
    if (departmentSelect && this.appConfig.departments) {
      const currentValue = departmentSelect.value;
      departmentSelect.innerHTML = '<option value="">Chọn phòng ban</option>';
      this.appConfig.departments.forEach(department => {
        const option = document.createElement('option');
        option.value = department;
        option.textContent = department;
        departmentSelect.appendChild(option);
      });
      departmentSelect.value = currentValue;
    }
  }

  /**
   * Save employee (add or update)
   */
  async saveEmployee() {
    const form = document.getElementById('employeeModalForm');
    const formData = new FormData(form);
    
    const employeeData = {
      id: formData.get('id').trim(),
      fullName: formData.get('fullName').trim(),
      position: formData.get('position') || '',
      department: formData.get('department') || ''
    };

    // Validation
    if (!employeeData.fullName) {
      Utils.showNotification('Bé chưa nhập họ và tên!', 'error');
      return;
    }
    
    if (!employeeData.id) {
      Utils.showNotification('Bé chưa nhập mã nhân viên!', 'error');
      return;
    }

    Utils.showLoading(true);
    
    try {
      let result;
      if (this.modalMode === 'edit' && this.currentEmployee) {
        result = await this.employeeService.updateEmployee(this.currentEmployee.id, employeeData);
      } else {
        result = await this.employeeService.createEmployee(employeeData);
      }
      
      if (result.success) {
        Utils.showNotification(
          this.modalMode === 'edit' ? 'Bé Cập nhật nhân viên thành công!' : 'Bé Thêm nhân viên thành công!',
          'success'
        );
        this.closeModal();
        await this.loadEmployees();
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      Utils.showNotification('Lỗi anh, anh vô dụngggg: ' + error.message, 'error');
    } finally {
      Utils.showLoading(false);
    }
  }

  /**
   * Delete employee from modal
   */
  async deleteEmployeeFromModal() {
    if (!this.currentEmployee) return;

    const confirmed = await Utils.confirm(`Bé chắc chắn muốn xóa "${this.currentEmployee.fullName}" hả ?`);
    if (!confirmed) return;
    
    Utils.showLoading(true);
    
    try {
      const result = await this.employeeService.deleteEmployee(this.currentEmployee.id);
      
      if (result.success) {
        Utils.showNotification('Nhân viên pay màu', 'success');
        this.closeModal();
        await this.loadEmployees();
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
}

// Initialize when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  window.employeeManager = new EmployeeManager();
});
