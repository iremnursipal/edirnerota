# Edirne Rota Backend

Node.js + Express + MySQL backend with authentication and password reset functionality.

## 🚀 Features

- ✅ User Registration & Login (JWT)
- ✅ Password Reset Flow (Email-based)
- ✅ Protected Routes (JWT middleware)
- ✅ Rate Limiting (Login & Password Reset)
- ✅ Input Validation
- ✅ Security Headers (Helmet, CORS)
- ✅ Graceful Shutdown
- ✅ Email Service (Nodemailer)

## 📚 Documentation

- **[Frontend API Guide](docs/FRONTEND_API_GUIDE.md)** - Complete API documentation for frontend developers
- **[Password Reset Flow](docs/PASSWORD_RESET.md)** - Detailed password reset implementation guide

## 🛠️ Quick Start

### Prerequisites
- Node.js (v14+)
- MySQL (v5.7+)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (copy from `.env.example`):
   ```bash
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=edirne_rota_db
   JWT_SECRET=your_secret_key
   PORT=3000
   ```

4. Run database migration:
   ```bash
   node scripts/run_migration.js
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/auth/me` | Get user profile (protected) |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |

## 🧪 Testing

### Thunder Client Collection
Import `thunder-collection_edirne-rota-auth.json` into Thunder Client for quick testing.

### Test Accounts
```
Email: testuser@edirne.com
Password: yeniSifre123
```

## 📖 Full Documentation

See [FRONTEND_API_GUIDE.md](docs/FRONTEND_API_GUIDE.md) for:
- Detailed endpoint documentation
- Request/Response examples
- Error handling
- Frontend integration examples
- Troubleshooting

## 🔧 Project Structure

```
edirnerota/
├── src/
│   ├── app.js              # Express app setup
│   ├── config/
│   │   └── veritabani.js   # MySQL connection
│   ├── controllers/
│   │   └── auth.js         # Auth controllers
│   ├── services/
│   │   ├── authService.js  # Auth business logic
│   │   └── emailService.js # Email sending
│   ├── models/
│   │   └── userModel.js    # User DB operations
│   ├── middleware/
│   │   └── authMiddleware.js # JWT verification
│   └── routes/
│       └── index.js        # API routes
├── migrations/             # Database migrations
├── scripts/               # Utility scripts
├── frontend-examples/     # HTML examples
└── docs/                  # Documentation
```

## 🔐 Security Features

- Password hashing (bcrypt)
- JWT authentication (7-day expiry)
- Rate limiting (login & password reset)
- CORS protection
- Helmet security headers
- Input validation
- Token-based password reset (1-hour expiry)

## 📧 Email Configuration

For production, update `.env` with SMTP settings:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🤝 Contributing

This is a graduation project. For questions or issues, contact the development team.

## 📄 License

MIT
