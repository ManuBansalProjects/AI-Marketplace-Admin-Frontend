# Sentinel Platform - MongoDB Admin Panel

## Project Overview
Sentinel Platform is an advanced admin panel integrated with MongoDB for managing a buy/sell marketplace. Built with React, TypeScript, Vite, Express, and MongoDB.

## Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend API**: Express + MongoDB driver
- **Database**: MongoDB Atlas (ai-buy-selling)
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Authentication**: Custom single admin auth system
- **State Management**: TanStack Query (React Query) v5
- **Charts**: Recharts

## Recent Changes (October 3, 2025)

### MongoDB Integration
- Created Express backend server (port 3001) to connect to MongoDB
- Implemented secure API endpoints with authentication middleware
- Integrated real marketplace data from MongoDB (users and products collections)
- Added API proxy in Vite config to route `/api` requests to backend

### Security Implementation
- Implemented API key authentication for all MongoDB endpoints
- Protected backend routes with `requireAuth` middleware
- Frontend sends API key with all MongoDB API requests
- Admin credentials stored securely in environment variables

### Admin Features
- Single admin authentication system (admin@sentinel.com)
- User management (view, block/unblock users)
- Payment processing to users
- Product/task management (view buy/sell tasks)
- Real-time analytics dashboard
- Commission tracking and earnings breakdown

## Project Structure
```
├── server/
│   ├── index.js          # Express API server
│   ├── db.js            # MongoDB connection
│   └── auth.js          # Authentication middleware
├── src/
│   ├── components/ui/   # shadcn/ui components
│   ├── lib/
│   │   └── adminAuth.ts # Admin authentication helper
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Dashboard.tsx     # Analytics dashboard
│   │   │   ├── Users.tsx         # User management
│   │   │   ├── Deals.tsx         # Products/Tasks
│   │   │   ├── Earnings.tsx      # Commission & payments
│   │   │   └── AdminLayout.tsx   # Admin layout wrapper
│   │   ├── Auth.tsx              # Admin login
│   │   └── Index.tsx             # Landing page
│   └── App.tsx          # Main app with routing
├── start-dev.sh         # Script to run both servers
└── vite.config.ts       # Vite config with API proxy
```

## MongoDB Database Schema

### Users Collection (13 users)
- `_id`: MongoDB ObjectID
- `name`: User's full name
- `email`: Email address
- `phone`: Phone number
- `createdAt`, `updatedAt`: Timestamps
- `access_token`: JWT token for mobile app
- `blocked`: (optional) Block status

### Products Collection (34 products/tasks)
- `_id`: MongoDB ObjectID
- `title`: Task title
- `description`: Task description
- `price`: Amount in rupees
- `task_type`: "buy" or "sell"
- `category`: Product category (electronics, books, fashion)
- `subcategory`: Subcategory
- `created_by`: User ObjectID reference
- `images`: Array of image objects
- `location`: Location object
- `createdAt`, `updatedAt`: Timestamps

### Payments Collection (admin-managed)
- `_id`: MongoDB ObjectID
- `userId`: User ObjectID reference
- `amount`: Payment amount
- `method`: Payment method (UPI, bank transfer, etc.)
- `description`: Payment description
- `status`: Payment status
- `paidAt`, `createdAt`: Timestamps

## API Endpoints

All MongoDB endpoints require authentication via `X-API-Key` header.

### Analytics
- `GET /api/mongo/analytics` - Get platform analytics (users, tasks, categories)
- `GET /api/mongo/earnings` - Get commission breakdown and earnings

### User Management
- `GET /api/mongo/users` - Get all users (passwords excluded)
- `PATCH /api/mongo/users/:userId/status` - Block/unblock user

### Products/Tasks
- `GET /api/mongo/products` - Get all products with creator info

### Payments
- `GET /api/mongo/payments` - Get payment history
- `POST /api/mongo/payments` - Process payment to user

## Environment Variables

### Required (Configured in Replit Secrets)
- `MONGO_CONNECTION_STRING`: MongoDB Atlas connection string
- `MONGO_USERNAME`: MongoDB username
- `MONGO_PASSWORD`: MongoDB password

### Optional (Frontend)
- `VITE_ADMIN_EMAIL`: Admin email (default: admin@sentinel.com)
- `VITE_ADMIN_PASSWORD`: Admin password (default: admin123)
- `VITE_ADMIN_API_KEY`: API key for backend auth

### Optional (Backend)
- `ADMIN_API_KEY`: API key for securing MongoDB endpoints
- `PORT`: Backend server port (default: 3001)

## Development Setup

### Running the Application
Both frontend and backend run together via:
```bash
bash start-dev.sh
```

This starts:
- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:5000

### Admin Login Credentials
- Email: `admin@sentinel.com`
- Password: `admin123`

### Configuration Details

**Vite Server (Port 5000):**
- Host: 0.0.0.0 (allows external connections)
- Proxy: `/api` → `http://localhost:3001`
- HMR: WSS protocol on port 443 for Replit

**Express Server (Port 3001):**
- Host: localhost
- CORS: Enabled
- Authentication: API key required for MongoDB routes

## Key Features

### Dashboard
- Total users and new user count
- Buy/sell task statistics
- Total marketplace value
- Commission breakdown by task type
- Category distribution charts

### User Management
- View all registered users
- Search by name, email, or phone
- Block/unblock users
- Process payments to users
- Track user activity

### Products/Tasks
- View all buy and sell tasks
- Filter by type (buy/sell)
- Search products
- See creator information
- Calculate commission per task

### Earnings & Payments
- Total task value tracking
- 10% commission rate calculation
- Commission breakdown by task type
- Payment history to users
- Net revenue calculation

## Security Features
- Backend API authentication via API key
- Frontend-only admin authentication
- MongoDB credentials in Replit secrets
- Sensitive data excluded from API responses (passwords, tokens)
- CORS configured for security

## Important Notes
- Only one admin account is supported
- All monetary values in Indian Rupees (₹)
- Default commission rate: 10%
- User passwords and tokens are excluded from API responses
- Payment system tracks all transactions to users
- Application uses in-memory authentication (resets on refresh)
