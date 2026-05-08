# 📝 Keeper — Backend

> The server-side of Keep, a production-ready note-taking application. Built with Node.js and Express, featuring enterprise-grade authentication, real-time collaboration, dual-database architecture, and Stripe-powered subscriptions.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + Express.js |
| Database | MySQL (Sequelize) |
| Cache | Redis |
| Real-time | Socket.io |
| Payments | Stripe |
| Logging | Winston |
| Validation | Zod |
| API Docs | Swagger / OpenAPI |

---

## ✨ Features

### 🔐 Authentication
- Email/password signup & login
- Google OAuth & GitHub OAuth
- Passkey / WebAuthn
- Multi-Factor Authentication (TOTP-based MFA)
- Two-Factor Authentication (2FA)
- Email verification & password reset
- JWT-based session management
- Inactivity-based auto-logout

### 📒 Notes Management
- Full CRUD operations
- Pin, archive, and soft-delete (trash bin) notes
- Labels & categories with custom color codes
- Background colors per note
- Image attachments
- Checklist / list items within notes

### ⏰ Reminders
- One-time reminders
- Recurring reminders — daily, weekly, monthly, yearly

### 🤝 Collaboration
- Invite collaborators via email
- Email notifications for collaborators
- View & remove collaborators
- Real-time collaborative editing via Socket.io

### 💳 Payments & Subscriptions
- Stripe integration
- Multiple subscription tiers
- Payment method management
- Upgrade / cancel subscriptions
- Stripe webhook handling

### 🔑 Developer API
- API key generation & revocation

### 🔒 Security
- bcrypt password hashing
- Rate limiting
- CORS protection
- Cloudflare Turnstile (bot protection)

### ⚙️ Other
- Email notifications (verification, password reset, collaborator invites)
- Cron jobs for scheduled cleanup
- Comprehensive error handling

---

## 🗂️ Project Structure

```
keep-backend/
├── src/
│   ├── routes/           # Express route definitions
│   ├── controllers/      # Request handlers
│   ├── models/           # Mongoose + Sequelize models
│   ├── middleware/        # Auth, rate limiting, validation
│   ├── services/         # Business logic
│   ├── jobs/             # Cron jobs
│   └── utils/            # Helpers & utilities
├── .env.example
├── package.json
└── ...
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- MySQL instance
- Redis instance
- Stripe account
- Google & GitHub OAuth credentials

### Installation

```bash
cd keep-backend
npm install
cp .env.example .env
npm run dev
```

### Environment Variables

```env
# Server
PORT=

# Database
MYSQL_URI=
REDIS_URL=

# Auth
JWT_SECRET=

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Cloudflare Turnstile
TURNSTILE_SECRET_KEY=
```

---

## 📖 API Documentation

Swagger UI is available once the server is running:

```
http://localhost:<PORT>/api-docs
```

---
