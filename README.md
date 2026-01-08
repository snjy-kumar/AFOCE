# Nepal Accounting Software

A comprehensive accounting application built for small businesses in Nepal, featuring invoicing, expense tracking, VAT management, and financial reporting.

## 🚀 Features

- ✅ **Authentication** - Secure JWT-based login/registration
- ✅ **Dashboard** - Real-time business metrics and insights  
- ✅ **Invoicing** - Create, manage, and track invoices
- ✅ **Expense Tracking** - Record and categorize business expenses
- ✅ **Customer/Vendor Management** - Maintain contact databases
- ✅ **Chart of Accounts** - Customizable accounting structure
- ✅ **VAT Management** - Calculate and track Nepal VAT (13%)
- ✅ **Bank Reconciliation** - Match transactions with statements
- ✅ **Financial Reports** - P&L, Balance Sheet, Sales, Aging reports
- ✅ **File Uploads** - Attach receipts and documents

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js + TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication
- Zod Validation
- Multer (File uploads)

### Frontend
- React 18 + TypeScript + Vite
- TanStack Query (React Query)
- React Router DOM
- React Hook Form + Zod
- Zustand (State management)
- Recharts (Data visualization)
- Tailwind CSS
- React Hot Toast

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## 🚀 Quick Start

### 1. Clone the repository

\`\`\`bash
git clone <repository-url>
cd accounting-web-app
\`\`\`

### 2. Setup Backend

\`\`\`bash
cd server
npm install

# Configure environment variables
# Edit .env file with your database credentials
# DATABASE_URL is already configured

# Generate Prisma client
npx prisma generate

# Push database schema (already done)
npx prisma db push

# Optional: Seed initial data
npm run seed

# Start development server
npm run dev
\`\`\`

Backend will run at: **http://localhost:5000**

### 3. Setup Frontend

\`\`\`bash
cd client
npm install

# Start development server
npm run dev
\`\`\`

Frontend will run at: **http://localhost:5173**

## 🎯 Usage

1. **Register** - Create a new account at `/register`
2. **Login** - Sign in at `/login`
3. **Setup** - Configure your Chart of Accounts
4. **Add Contacts** - Create customers and vendors
5. **Create Invoices** - Generate sales invoices
6. **Track Expenses** - Record business expenses
7. **View Reports** - Access financial insights
8. **VAT Management** - Calculate and file VAT returns

## 📁 Project Structure

\`\`\`
accounting-web-app/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and API client
│   │   ├── stores/        # Zustand state management
│   │   └── types/         # TypeScript types
│   └── public/
│
└── server/                # Backend Express app
    ├── src/
    │   ├── controllers/   # Request handlers
    │   ├── services/      # Business logic
    │   ├── routes/        # API routes
    │   ├── middleware/    # Express middleware
    │   ├── schemas/       # Zod validation schemas
    │   └── types/         # TypeScript types
    ├── prisma/
    │   └── schema.prisma  # Database schema
    └── uploads/           # File storage
\`\`\`

## 🔐 Environment Variables

### Server (.env)
\`\`\`env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/nepal_accounting
JWT_SECRET=your-secret-key-minimum-32-characters
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
\`\`\`

### Client (.env.local) - Optional
\`\`\`env
VITE_API_URL=http://localhost:5000/api
\`\`\`

## 🧪 Testing

\`\`\`bash
# Backend tests (to be implemented)
cd server
npm test

# Frontend tests (to be implemented)
cd client
npm test
\`\`\`

## 🏗️ Building for Production

### Backend
\`\`\`bash
cd server
npm run build
npm start
\`\`\`

### Frontend
\`\`\`bash
cd client
npm run build
npm run preview
\`\`\`

## 📊 Database Schema

Key entities:
- Users (authentication & business profile)
- Customers & Vendors
- Invoices & Invoice Items
- Expenses
- Accounts (Chart of Accounts)
- Bank Accounts & Transactions
- VAT Records
- Sync Queue (offline support)

## 🔧 Development

### Available Scripts

#### Server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run seed` - Seed database with initial data

#### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/dashboard` - Get dashboard stats
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Create expense
- `GET /api/reports/profit-loss` - P&L report
- `GET /api/vat/records` - VAT records
- And many more...

## 🚧 Current Status

✅ **Completed (95%)**
- Backend API fully implemented
- Frontend pages and components
- Database schema and migrations
- Authentication flow
- Toast notifications
- Protected routes

⚠️ **In Progress**
- Edit Invoice/Expense pages
- End-to-end testing
- Error handling improvements

📋 **Planned**
- Nepali language support
- Nepali date (Bikram Sambat)
- PDF generation for invoices
- Email notifications
- Recurring invoices
- Advanced reporting

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@example.com or open an issue on GitHub.

---

**Built with ❤️ for Nepal's small businesses**
