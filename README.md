# Traffic SEO Backend

Backend service cho hệ thống Traffic SEO, được xây dựng bằng Node.js và TypeScript.

## 🚀 Tính năng

- Kiến trúc multi-process với Node.js Cluster
- Tích hợp Redis cho caching
- Hỗ trợ PostgreSQL database
- Hệ thống logging chi tiết
- Graceful shutdown
- Backup database tự động
- Hot-reloading trong môi trường development

## 📋 Yêu cầu hệ thống

- Node.js >= 16.x
- PostgreSQL >= 12.x
- Redis >= 6.x
- npm hoặc yarn

## 🔧 Cài đặt

1. Clone repository:
```bash
git clone [repository-url]
cd traffic-seo-be
```

2. Cài đặt dependencies:
```bash
npm install
# hoặc
yarn install
```

3. Tạo file .env từ .env.example:
```bash
cp .env.example .env
```

4. Cấu hình các biến môi trường trong file .env:
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 🏃‍♂️ Chạy dự án

### Development mode
```bash
npm run dev
# hoặc
yarn dev
```

### Production mode
```bash
npm run build
npm start
# hoặc
yarn build
yarn start
```

## 📁 Cấu trúc thư mục

```
src/
├── config/         # Cấu hình ứng dụng
├── database/       # Kết nối và models database
├── middleware/     # Express middleware
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── app.ts          # Entry point
```

## 🔍 API Documentation

API documentation có thể được tìm thấy tại `/api-docs` khi chạy server.

## 🛠 Công nghệ sử dụng

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Redis
- Cluster
- Winston (logging)

## 🔒 Bảo mật

- Xử lý graceful shutdown
- Logging chi tiết
- Backup database tự động
- Xử lý lỗi tập trung

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

