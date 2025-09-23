# HRM-TUEMINH - Hệ thống quản lý nhân viên

Một ứng dụng desktop được xây dựng bằng Electron theo mô hình MVC để quản lý thông tin nhân viên, hỗ trợ đầy đủ các chức năng CRUD (Create, Read, Update, Delete) với tích hợp Excel.

## ✨ Tính năng chính

### 📋 Quản lý nhân viên
- **Thêm nhân viên mới**: Form đầy đủ thông tin với validation
- **Xem danh sách nhân viên**: Hiển thị dạng bảng với đầy đủ thông tin
- **Chỉnh sửa thông tin**: Cập nhật thông tin nhân viên đã có
- **Xóa nhân viên**: Xóa với xác nhận an toàn
- **Tìm kiếm**: Tìm kiếm theo tên, email, điện thoại, chức vụ, phòng ban
- **Lọc dữ liệu**: Lọc theo phòng ban, chức vụ, trạng thái
- **Thống kê**: Hiển thị thống kê tổng quan

### 📊 Tích hợp Excel
- **Lưu trữ dữ liệu**: Tất cả dữ liệu được lưu trong file Excel
- **Xuất báo cáo**: Xuất danh sách nhân viên ra file Excel
- **Backup**: Tạo backup dữ liệu tự động
- **Tương thích**: Sử dụng sheet riêng "HRM_Employees" không ảnh hưởng đến dữ liệu khác

### 💼 Thông tin nhân viên bao gồm:
- **Thông tin cơ bản**: Họ tên, Email, Số điện thoại
- **Công việc**: Chức vụ, Phòng ban, Mức lương
- **Thời gian**: Ngày bắt đầu làm việc
- **Trạng thái**: Đang làm việc, Nghỉ phép, Đã nghỉ việc
- **Metadata**: ID tự động, Thời gian tạo/cập nhật

## 🏗️ Kiến trúc MVC

### 📁 Cấu trúc thư mục
```
HRM-TUEMINH/
├── excel/
│   └── MASTERLIST_FV.xlsx          # File Excel chứa dữ liệu
├── public/                         # View Layer
│   ├── css/
│   │   └── styles.css             # Styles chính
│   ├── js/
│   │   ├── app.js                 # Main frontend controller
│   │   ├── employee-service.js    # Service client
│   │   └── utils.js               # Frontend utilities
│   └── index.html                 # Giao diện chính
├── src/                           # Backend MVC
│   ├── config/
│   │   └── app.js                 # Cấu hình ứng dụng
│   ├── controllers/
│   │   └── EmployeeController.js  # Controller xử lý logic
│   ├── models/
│   │   └── Employee.js            # Model dữ liệu nhân viên
│   ├── services/
│   │   ├── EmployeeService.js     # Business logic
│   │   └── ExcelService.js        # Excel operations
│   ├── utils/
│   │   ├── ValidationUtils.js     # Validation utilities
│   │   └── FormatUtils.js         # Format utilities
│   └── main.js                    # Main process (Entry point)
├── package.json                   # Dependencies và scripts
└── README.md                      # Documentation
```

### 🎯 Mô hình MVC

#### Model (src/models/)
- **Employee.js**: Định nghĩa cấu trúc dữ liệu, validation và business rules
- Xử lý format dữ liệu, validation input
- Chuyển đổi dữ liệu giữa các layer

#### View (public/)
- **HTML**: Giao diện người dùng
- **CSS**: Styling responsive và modern
- **JavaScript**: Logic frontend, tương tác người dùng

#### Controller (src/controllers/)
- **EmployeeController.js**: Xử lý các request từ frontend
- Điều phối giữa Model và Service
- Xử lý response trả về frontend

#### Service (src/services/)
- **EmployeeService.js**: Business logic cho nhân viên
- **ExcelService.js**: Xử lý file Excel
- Tách biệt logic nghiệp vụ khỏi controller

#### Config & Utils
- **Config**: Cấu hình tập trung
- **Utils**: Các hàm tiện ích tái sử dụng
- **Validation**: Kiểm tra dữ liệu

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js (phiên bản 14 trở lên)
- Windows/macOS/Linux

### Các bước cài đặt

1. **Clone repository**
   ```bash
   git clone https://github.com/phamdaiminhquan/HRM-TUEMINH.git
   cd HRM-TUEMINH
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   ```

3. **Chạy ứng dụng**
   ```bash
   npm start
   ```

## 🎯 Hướng dẫn sử dụng

### Thêm nhân viên mới
1. Điền đầy đủ thông tin vào form (các trường có dấu * là bắt buộc)
2. Click "Thêm nhân viên"
3. Dữ liệu sẽ được lưu vào Excel tự động

### Chỉnh sửa nhân viên
1. Click nút "✏️" ở cột Thao tác
2. Form sẽ được điền sẵn thông tin hiện tại
3. Chỉnh sửa và click "Cập nhật"

### Xóa nhân viên
1. Click nút "🗑️" ở cột Thao tác
2. Xác nhận xóa trong dialog
3. Nhân viên sẽ bị xóa khỏi danh sách và Excel

### Tìm kiếm và lọc
- **Tìm kiếm**: Gõ từ khóa vào ô tìm kiếm
- **Lọc**: Chọn các bộ lọc theo phòng ban, chức vụ, trạng thái
- **Xóa bộ lọc**: Click "Xóa bộ lọc" để reset

### Xuất Excel và Backup
- **Xuất Excel**: Click "📊 Xuất Excel", chọn vị trí lưu
- **Backup**: Click "💾 Backup" để tạo bản sao lưu
- **Tải lại**: Click "🔄 Tải lại" để refresh dữ liệu

## 🛠️ Công nghệ sử dụng

### Backend
- **Electron** - Framework chính cho ứng dụng desktop
- **Node.js** - Runtime JavaScript
- **XLSX** - Thư viện xử lý file Excel
- **IPC** - Giao tiếp giữa main và renderer process

### Frontend
- **HTML5** - Cấu trúc giao diện
- **CSS3** - Styling với Grid và Flexbox
- **JavaScript ES6+** - Logic frontend
- **MVC Pattern** - Tổ chức code

### Architecture Patterns
- **MVC (Model-View-Controller)** - Kiến trúc chính
- **Service Layer Pattern** - Tách biệt business logic
- **Repository Pattern** - Truy cập dữ liệu
- **Observer Pattern** - Event handling

## 📝 Scripts có sẵn

- `npm start`: Chạy ứng dụng
- `npm run dev`: Chạy ở chế độ development

## 🔧 Tùy chỉnh và mở rộng

### Thêm trường thông tin mới
1. **Model**: Cập nhật `src/models/Employee.js`
2. **View**: Thêm field vào `public/index.html`
3. **Controller**: Cập nhật validation trong controller
4. **Frontend**: Cập nhật logic trong `public/js/app.js`

### Thêm chức năng mới
1. **Service**: Tạo method mới trong `src/services/`
2. **Controller**: Thêm endpoint trong controller
3. **Frontend**: Tạo UI và logic tương ứng
4. **IPC**: Đăng ký handler trong `main.js`

### Thay đổi cấu hình
- **App Config**: Sửa `src/config/app.js`
- **UI Config**: Cập nhật CSS trong `public/css/styles.css`
- **Validation Rules**: Điều chỉnh trong Model và Utils

## 📊 Tính năng nâng cao

### Validation
- Email format và unique check
- Phone number format (VN)
- Required fields validation
- Data type validation

### Error Handling
- Try-catch comprehensive
- User-friendly error messages
- Graceful degradation
- Console logging for debugging

### Performance
- Debounced search
- Efficient filtering
- Memory management
- Optimized rendering

### UX/UI
- Responsive design
- Loading indicators
- Success/error notifications
- Keyboard shortcuts
- Smooth animations

## 🔒 Bảo mật và Ổn định

- Input sanitization
- File access validation
- Error boundary
- Backup system
- Data integrity checks

## ⚠️ Lưu ý quan trọng

1. **Backup dữ liệu**: Thường xuyên backup file Excel
2. **File Excel**: Không xóa sheet "HRM_Employees" 
3. **Đồng bộ**: Tránh mở file Excel trong Excel khi đang chạy ứng dụng
4. **Validation**: Email phải duy nhất trong hệ thống
5. **Performance**: Khuyến nghị < 10,000 records cho performance tốt

## 🔄 Cập nhật và Bảo trì

### Version Control
- Git flow chuẩn
- Semantic versioning
- Changelog maintenance

### Code Quality
- ESLint configuration
- Code documentation
- Unit tests (planned)
- Performance monitoring

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Distributed under the ISC License. See `LICENSE` for more information.

## 📞 Liên hệ

- Repository: [https://github.com/phamdaiminhquan/HRM-TUEMINH](https://github.com/phamdaiminhquan/HRM-TUEMINH)
- Issues: [https://github.com/phamdaiminhquan/HRM-TUEMINH/issues](https://github.com/phamdaiminhquan/HRM-TUEMINH/issues)

---

**HRM-TUEMINH v2.0** - Hệ thống quản lý nhân viên với kiến trúc MVC chuyên nghiệp! 🚀