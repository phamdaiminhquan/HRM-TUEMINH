const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const config = require('./config/app');
const EmployeeController = require('./controllers/EmployeeController');

let mainWindow;
let employeeController;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: config.window.width,
    height: config.window.height,
    minWidth: config.window.minWidth,
    minHeight: config.window.minHeight,
    title: config.app.title,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, '../public/assets/icon.png') // Nếu có icon
  });

  mainWindow.loadFile(path.join(__dirname, '../public/index.html'));
  
  // Mở DevTools trong môi trường development
  if (config.app.isDevelopment) {
    mainWindow.webContents.openDevTools();
  }
}

function setupIPC() {
  // Khởi tạo controller
  employeeController = new EmployeeController();

  // Employee endpoints
  ipcMain.handle('employee:getAll', employeeController.getAllEmployees.bind(employeeController));
  ipcMain.handle('employee:getById', employeeController.getEmployeeById.bind(employeeController));
  ipcMain.handle('employee:create', employeeController.createEmployee.bind(employeeController));
  ipcMain.handle('employee:update', employeeController.updateEmployee.bind(employeeController));
  ipcMain.handle('employee:delete', employeeController.deleteEmployee.bind(employeeController));
  ipcMain.handle('employee:search', employeeController.searchEmployees.bind(employeeController));
  ipcMain.handle('employee:filter', employeeController.filterEmployees.bind(employeeController));
  ipcMain.handle('employee:export', employeeController.exportToExcel.bind(employeeController));
  ipcMain.handle('employee:backup', employeeController.createBackup.bind(employeeController));
  ipcMain.handle('employee:statistics', employeeController.getStatistics.bind(employeeController));
  ipcMain.handle('employee:validate', employeeController.validateEmployeeData.bind(employeeController));

  // App info endpoints
  ipcMain.handle('app:getConfig', () => ({
    success: true,
    data: {
      version: config.app.version,
      title: config.app.title,
      positions: config.employee.positions,
      departments: config.employee.departments,
      statuses: config.employee.statuses
    }
  }));

  // Debug APIs
  ipcMain.handle('employee:createSampleWithoutHeaders', (event) => 
    employeeController.createSampleFileWithoutHeaders(event)
  );

  ipcMain.handle('employee:createSampleWithHeaders', (event) => 
    employeeController.createSampleFileWithHeaders(event)
  );

  ipcMain.handle('employee:toggleHeaderMode', (event) => 
    employeeController.toggleHeaderMode(event)
  );

  ipcMain.handle('employee:getConfigInfo', (event) => 
    employeeController.getConfigInfo(event)
  );
}

app.whenReady().then(() => {
  createWindow();
  setupIPC();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Xử lý lỗi không được bắt
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
