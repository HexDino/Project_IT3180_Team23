# BlueMoon Apartment Management System

Hệ thống quản lý chung cư BlueMoon - Một giải pháp toàn diện để quản lý phí, cư dân và hộ gia đình.

## 🌟 Tính năng chính

- **Quản lý hộ gia đình**: Đăng ký và quản lý thông tin hộ gia đình
- **Quản lý cư dân**: Theo dõi cư dân và thông tin chi tiết
- **Quản lý phí**: Định nghĩa các loại phí khác nhau (bắt buộc, tự nguyện, đỗ xe, tiện ích)
- **Theo dõi thanh toán**: Ghi nhận và giám sát tình trạng thanh toán
- **Dashboard phân tích**: Hiển thị trực quan doanh thu theo loại phí và xu hướng hàng tháng
- **Tạm trú/Tạm vắng**: Xử lý cư dân tạm trú và tạm vắng
- **Xác thực người dùng**: Hệ thống đăng nhập bảo mật cho quản trị viên

## 🛠️ Công nghệ sử dụng

### Backend
- Node.js với Express.js
- MongoDB với Mongoose ODM
- JWT Authentication
- RESTful API

### Frontend
- React.js với functional components và hooks
- React Bootstrap cho UI
- Chart.js cho visualization dữ liệu
- Axios cho API communication
- React Router cho navigation

## 🚀 Cài đặt

### Yêu cầu hệ thống
- Node.js (v14+)
- MongoDB
- npm hoặc yarn

### Hướng dẫn cài đặt

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd bluemoon-apartment-management
   ```

2. **Cài đặt dependencies**
   ```bash
   # Cài đặt backend
   cd backend
   npm install
   
   # Cài đặt frontend  
   cd ../frontend
   npm install
   ```

3. **Cấu hình môi trường**
   
   Tạo file `.env` trong thư mục backend:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/bluemoon_apartment
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   ```

4. **Khởi động MongoDB**
   ```bash
   mongod
   ```

5. **Tạo dữ liệu mẫu**
   ```bash
   cd backend
   
   # Tạo admin user
   node createAdminUser.js
   
   # Tạo dữ liệu test cơ bản
   node seeders/createTestData.js
   
   # Tạo dữ liệu mẫu lớn (tùy chọn)
   node scripts/createMassiveTestData.js
   ```

6. **Chạy ứng dụng**
   ```bash
   # Backend (port 5000)
   cd backend
   npm run dev
   
   # Frontend (port 3000) - terminal khác
   cd frontend
   npm start
   ```

Truy cập ứng dụng tại `http://localhost:3000`

## 🔐 Tài khoản mặc định

- **Username**: admin
- **Password**: admin123

## 📊 Dữ liệu mẫu

Hệ thống bao gồm script tạo dữ liệu mẫu phong phú:
- **53 hộ gia đình** (A01-J50)
- **196 cư dân** (2-5 người/hộ)
- **9 loại phí** đa dạng
- **1,334+ thanh toán** trong 6 tháng
- **Dashboard** với biểu đồ chi tiết

## 🔄 Cấu trúc dự án

```
bluemoon-apartment-management/
├── backend/
│   ├── controllers/         # Logic xử lý
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Middleware
│   ├── scripts/            # Scripts tiện ích
│   ├── seeders/            # Dữ liệu mẫu
│   └── server.js           # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── screens/        # Page components
│   │   ├── context/        # React context
│   │   └── App.js
│   └── public/
└── README.md
```

## 🌐 API Endpoints

### Dashboard
- `GET /api/statistics/dashboard` - Thống kê dashboard

### Authentication  
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký

### Quản lý
- `GET/POST/PUT/DELETE /api/households` - Hộ gia đình
- `GET/POST/PUT/DELETE /api/residents` - Cư dân
- `GET/POST/PUT/DELETE /api/fees` - Phí
- `GET/POST/PUT/DELETE /api/payments` - Thanh toán

## 📝 License

MIT License 