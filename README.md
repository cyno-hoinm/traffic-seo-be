# Traffic SEO Backend

Backend service cho hệ thống Traffic SEO, được xây dựng bằng Node.js và TypeScript.

## 🚀 Tính năng

- Kiến trúc multi-process với Node.js Cluster
- Tích hợp Redis cho caching
- Hỗ trợ PostgreSQL database
- Hệ thống logging chi tiết
- Graceful shutdown
- Backup database tự động
- Sendmail tự động
- Hot-reloading trong môi trường development
- Deployment bằng PM2
- Tích hợp các cổng thanh toán online PayOs, Oxapay
- Sử dụng API Bot Python để chạy traffic


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

PORT=
DEV_URL=
FRONT_END_URL=
# DATABSE
DB_HOST=
DB_US=
DB_PW=
DB_NAME=
DB_PORT=

# NODE ENV
NODE_ENV=
# CORS
CORS_ORIGINS=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=

# OXAPAY
OXAPAY_URL=
OXAPAY_MERCHANT_KEY=
OXAPAY_LIFETTIME=
OXAPAY_FEEPAID_BY_PAYER=
OXAPAY_UNDER_PAID_COVER=
OXAPAY_PAYOUT_KEY=
OXAPAY_PAYOUT_ADDRESS=
OXAPAY_SANDBOX=
# REDIS
REDIS_HOST=
PORT_REDIS=
REDIS_US=
REDIS_PW=

# PAYOS
PAY_OS_CLIENT=
PAY_OS_API_KEY=
PAY_OS_CHECKSUM=

# Python
JWT_API_PYTHON=
URL_API_PYTHON=

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
npm run deploy
# hoặc
yarn build
yarn deploy
```

## 📁 Cấu trúc thư mục

```
src/
├── config/         # Cấu hình ứng dụng
├── constants/      # Chứa các biến không đổi của hệ thống
├── controllers/    # Các modules gọi repository
├── database/       # Kết nối và models database
├── enums/          # Chứa các kiểu dữ liệu enums
├── interfaces/     # TypeScript type definitions
├── middleware/     # Express middleware
├── models/         # Database model
├── repository/     # Business logic
├── routes/         # API routes
├── services/       # Background service và API bên thứ 3
├── types/          # Response Type
├── utils/          # Utility functions
├── views/          # Template cho việc send email
└── app.ts          # Entry point
└── swagger.ts      # Cấu hình API docs
```

## 🔍 API Documentation

API documentation có thể được tìm thấy tại `/api/admin` cho role admin khi chạy server.
API documentation có thể được tìm thấy tại `/api/client` cho role customer khi chạy server.

## 🛠 Công nghệ sử dụng

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Redis
- Cluster
- Winston (logging)
- ORM - Sequelize
- Swagger

## 🔒 Bảo mật

- Xử lý graceful shutdown
- Logging chi tiết
- Backup database tự động
- Xử lý lỗi tập trung
- Rate limited
- Metrics
- Authentication bằng JWT
- Authorzation bằng phân quyền theo role

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

