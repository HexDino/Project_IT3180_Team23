# 🏢 Blue Moon Apartment Management System

Hệ thống quản lý chung cư Blue Moon - Dự án IT3180 Team 23

## 📋 Mô tả dự án

Hệ thống quản lý chung cư toàn diện được xây dựng bằng MERN Stack (MongoDB, Express, React, Node.js) để quản lý:
- Hộ gia đình và cư dân
- Các loại phí (quản lý, gửi xe, đóng góp)
- Thanh toán và doanh thu
- Báo cáo thống kê

## 🚀 Tính năng chính

### 👤 Quản lý người dùng
- Đăng nhập/đăng xuất
- Phân quyền: Admin, Manager, Staff, Accountant
- Quản lý thông tin cá nhân

### 🏠 Quản lý hộ gia đình
- Thêm/sửa/xóa hộ gia đình
- Quản lý thông tin căn hộ
- Theo dõi cư dân

### 👥 Quản lý cư dân
- Đăng ký cư dân mới
- Cập nhật thông tin
- Quản lý tạm trú/tạm vắng

### 💰 Quản lý phí và thanh toán
- Tạo các loại phí: quản lý hàng tháng, gửi xe, đóng góp
- Ghi nhận thanh toán
- Hoàn tiền (Admin/Accountant)
- Tìm kiếm và lọc thanh toán theo trạng thái

### 📊 Báo cáo và thống kê
- Dashboard tổng quan
- Doanh thu theo tháng
- Biểu đồ xu hướng 6 tháng
- Thanh toán gần đây

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React.js** - UI framework
- **React Router** - Navigation
- **React Bootstrap** - UI components
- **Axios** - HTTP client
- **Chart.js** - Data visualization

## 📦 Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js (v14+)
- MongoDB (v4.4+)
- npm hoặc yarn

### 1. Clone repository
```bash
git clone [repository-url]
cd Project_IT3180_Team23
```

### 2. Cài đặt Backend
```bash
cd backend
npm install
```

### 3. Cài đặt Frontend
```bash
cd ../frontend
npm install
```

### 4. Khởi động MongoDB
```bash
# Với Docker
docker run --name bluemoon-mongo -p 27017:27017 -d mongo

# Hoặc khởi động MongoDB service local
mongod
```

### 5. Cấu hình môi trường
Tạo file `.env` trong thư mục `backend`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/bluemoon_apartment
JWT_SECRET=your_jwt_secret_here
```

### 6. Tạo dữ liệu mẫu (tùy chọn)
```bash
cd backend
node createAdminUser.js
node createTestUsers.js
node createMassiveTestData.js
```

### 7. Chạy ứng dụng

#### Backend (Port 5000)
```bash
cd backend
npm run dev
```

#### Frontend (Port 3000)
```bash
cd frontend
npm start
```

## 👤 Tài khoản mặc định

- **Username:** admin
- **Password:** admin123
- **Role:** admin

## 📊 Dữ liệu mẫu

Khi chạy script tạo dữ liệu, hệ thống sẽ có:
- 53 hộ gia đình
- 187 cư dân
- 1,040 thanh toán
- 4 loại phí khác nhau
- 6 người dùng với các quyền khác nhau

## 🔐 Phân quyền

| Vai trò | Quyền hạn |
|---------|-----------|
| **Admin** | Toàn quyền hệ thống |
| **Manager** | Quản lý hộ gia đình, cư dân |
| **Staff** | Xem thông tin, ghi nhận thanh toán |
| **Accountant** | Quản lý phí, thanh toán, hoàn tiền |

## 📱 Giao diện

- **Dashboard:** Tổng quan hệ thống với biểu đồ
- **Quản lý hộ gia đình:** Danh sách và chi tiết hộ dân
- **Quản lý thanh toán:** Tìm kiếm, lọc theo trạng thái
- **Báo cáo:** Thống kê doanh thu và biểu đồ

## 🌟 Tính năng nổi bật

### Tìm kiếm thông minh
- Tìm kiếm thanh toán theo nhiều tiêu chí
- Lọc theo trạng thái: Đã thanh toán, Chưa thanh toán, Quá hạn, Đã hoàn tiền

### Dashboard thông minh
- Hiển thị **chỉ** các khoản phí đã thanh toán gần đây
- Biểu đồ doanh thu theo loại phí
- Xu hướng 6 tháng

### Hoàn tiền
- Chức năng hoàn tiền cho Admin/Accountant
- Ghi nhận người thực hiện và thời gian hoàn tiền

### Giao diện Việt hóa
- Toàn bộ giao diện bằng tiếng Việt
- Định dạng tiền tệ VND
- Ngày tháng theo chuẩn Việt Nam

## 🔧 API Endpoints

### Authentication
- `POST /api/users/login` - Đăng nhập
- `GET /api/users/profile` - Thông tin user

### Payments
- `GET /api/payments` - Danh sách thanh toán
- `GET /api/payments/:id` - Chi tiết thanh toán
- `PUT /api/payments/:id/refund` - Hoàn tiền
- `GET /api/payments/search` - Tìm kiếm thanh toán

### Statistics
- `GET /api/statistics/dashboard` - Dữ liệu dashboard
- `GET /api/statistics/monthly-report` - Báo cáo tháng

## 📈 Dữ liệu thống kê

- **Tổng doanh thu:** 447,340,000 VND
- **Doanh thu tháng hiện tại:** 67,030,000 VND
- **Tỷ lệ thanh toán:** 85.8% đã thanh toán
- **Trạng thái phân bố:**
  - Đã thanh toán: 892 (85.8%)
  - Chưa thanh toán: 95 (9.1%)
  - Quá hạn: 53 (5.1%)

## 👥 Team 23

Dự án được phát triển bởi Team 23 - IT3180

## 📄 License

Dự án giáo dục - IT3180 