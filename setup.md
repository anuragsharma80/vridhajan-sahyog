# Quick Setup Guide

## Step 1: Install MongoDB

### Option A: Local Installation
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Install with default settings
3. Start MongoDB service (usually starts automatically)

### Option B: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/atlas
2. Create free account
3. Create free cluster
4. Get connection string

## Step 2: Create .env File

Create a file named `.env` in the `backend` folder with this content:

```env
# Database Configuration
DATABASE_URI=mongodb://localhost:27017/vridhajan-sahyog
# OR for MongoDB Atlas (replace with your connection string):
# DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/vridhajan-sahyog

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Step 3: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../event-frontend
npm install
```

## Step 4: Start the Application

```bash
# From root directory
npm run dev
```

## Step 5: Access the Application

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Default Login Credentials

- Username: `admin`
- Password: `admin123`

## If MongoDB is not installed:

1. **Install MongoDB Community Server** (recommended for local development)
2. **OR use MongoDB Atlas** (cloud database - easier setup)

### For MongoDB Atlas:
1. Sign up at https://www.mongodb.com/atlas
2. Create a free cluster
3. Get your connection string
4. Replace the DATABASE_URI in .env file

## Troubleshooting

- **Port 3000 already in use**: Kill the process or change the port
- **MongoDB connection error**: Make sure MongoDB is running
- **CORS errors**: Check FRONTEND_URL in .env file
