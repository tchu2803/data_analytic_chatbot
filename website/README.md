
# Hướng dẫn Sử dụng Hệ thống Chatbot

## 1. Cài đặt

### Yêu cầu
- Python 3.8+: Cho backend Flask.
- PHP 8.x và Laravel: Cho backend API.
- Node.js: Cho frontend React.
- MySQL: Cơ sở dữ liệu.
- Pusher: Tài khoản cho giao tiếp thời gian thực.
- Alibaba API key: Cho nhúng tài liệu và mô hình ngôn ngữ (LLM).

### Python (Flask)
Vào thư mục python Flask:
```bash
cd chatbot
```

Tạo môi trường ảo:
```bash
python -m venv .venv
.venv\Scripts\activate
```

Cài đặt dependencies:
```bash
pip install -r requirements.txt
```
Tạo và chỉnh sửa tệp `.env`:
Nội dung cần thiết trong `.env`:
```
ALIBABA_API_KEY=
BASE_API_URL=

### Backend (Laravel)
```bash
cd laravel-backend
composer install
cp .env.example .env
php artisan key:generate
```
Cập nhật `.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=test_chatbot
DB_USERNAME=root
DB_PASSWORD=
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=
```

Tạo database MySQL và chạy migration:
```bash
php artisan migrate
```

### Frontend (React)
```bash
cd react-src
npm install
npm run dev
```

## 2. Chạy Thử Hệ thống

### Backend Flask
```bash
cd mcp-server
python main.py
```
API chạy tại `http://localhost:5000`.

### Backend Laravel
```bash
cd laravel-backend
php artisan serve
php artisan queue:work
```
API chạy tại `http://localhost:8000`.

### Frontend React
```bash
cd frontend
npm run dev
```
Giao diện tại `http://localhost:5173`.

### Kiểm tra
- Truy cập http://localhost:5173
- Đăng nhập hoặc đăng ký.
- Tạo cuộc trò chuyện và thử gửi câu hỏi như: “Liệt kê các bảng trong database.

## 3. Sử dụng Chatbot

### Giao diện
- **Sidebar**: Quản lý cuộc trò chuyện.
- **Message List**: Hiển thị lịch sử tin nhắn.
- **Message Input**: Nhập câu hỏi, tải file PDF.

### Tính năng
- Hỏi đáp tài liệu và dữ liệu từ database.
- Tải file PDF để chatbot sử dụng nội dung.
- Quản lý cuộc trò chuyện.

### Lưu ý
- Yêu cầu kết nối internet để dùng API Alibaba và Pusher.
- File PDF cần được đặt trong thư mục `data` nếu tải thủ công.
