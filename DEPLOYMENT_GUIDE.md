# 🚀 Vridhajan Sahyog - Render Deployment Guide

## Prerequisites
- GitHub repository with your code
- MongoDB Atlas account
- Render account (free tier available)

## Step 1: Prepare Your Backend

### 1.1 Create .env.example file in backend directory:
```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Configuration
JWT_ACCESS_SECRET=9adf897b9338b54a29ea1314587c5fa8cadf54cd2902446ef93a5c39cab0c017427e659035579ab10afafd01a337623501f9661d11876a3119b379dfde678d02

JWT_REFRESH_SECRET=da65a2c03daa8d38057341df002d05af9a20833c6dfa988d075590d531d0d9f594501724bf706c372811555185f4aa546bc2ae4a872bffc42c6c1f0ebecfaf89

# Frontend URL (update this with your frontend domain)
FRONTEND_URL=https://your-frontend-domain.com
```

### 1.2 Update package.json (already correct):
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

## Step 2: Set Up MongoDB Atlas

### 2.1 Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign in or create account
3. Click "Build a Database"
4. Choose "FREE" tier (M0)
5. Select a cloud provider and region
6. Create cluster

### 2.2 Configure Database Access
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and strong password
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### 2.3 Configure Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 2.4 Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with your database name

## Step 3: Deploy to Render

### 3.1 Create Render Account
1. Go to [Render](https://render.com)
2. Sign up with GitHub account
3. Authorize Render to access your repositories

### 3.2 Create New Web Service
1. Click "New +" in dashboard
2. Select "Web Service"
3. Connect your GitHub repository
4. Choose the repository containing your backend code

### 3.3 Configure Build Settings
Fill in the following details:

**Basic Settings:**
- **Name**: `vridhajan-sahyog-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)

**Build & Deploy:**
- **Root Directory**: `backend` (since your backend code is in a subfolder)
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Advanced Settings:**
- **Node Version**: `18`

### 3.4 Configure Environment Variables
In the "Environment" section, add these variables:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
JWT_ACCESS_SECRET=your_very_long_random_access_secret_key_here_at_least_32_characters
JWT_REFRESH_SECRET=your_very_long_random_refresh_secret_key_here_at_least_32_characters
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

**Important Notes:**
- Replace the MongoDB URI with your actual Atlas connection string
- Generate strong, random JWT secrets (at least 32 characters)
- Set FRONTEND_URL to your frontend domain (if you deploy frontend separately)

### 3.5 Deploy
1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Start your application
3. Wait for deployment to complete (usually 2-5 minutes)

## Step 4: Update Frontend Configuration

### 4.1 Update API Base URL
In your frontend `src/api.js`, update the base URL:

```javascript
// For development
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-service.onrender.com' 
  : 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## Step 5: Test Your Deployment

### 5.1 Check Deployment Status
1. Go to your Render dashboard
2. Click on your service
3. Check the "Logs" tab for any errors
4. Verify the service shows "Live" status

### 5.2 Test API Endpoints
Test your API endpoints using the Render URL:
```bash
# Test health endpoint
curl https://your-backend-service.onrender.com/

# Test member endpoint
curl https://your-backend-service.onrender.com/api/members
```

## Step 6: Security Best Practices

### 6.1 Environment Variables
- Never commit `.env` files to Git
- Use strong, unique secrets for JWT
- Rotate secrets regularly
- Use different databases for development and production

### 6.2 MongoDB Atlas Security
- Enable IP whitelisting
- Use strong database passwords
- Enable MongoDB Atlas authentication
- Consider using MongoDB Atlas encryption at rest

## Expected Render Service URL Format
Your deployed backend will be available at:
```
https://your-service-name.onrender.com
```

## Environment Variables Summary
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

## Deployment Checklist
- [ ] Repository is pushed to GitHub
- [ ] MongoDB Atlas cluster is created and configured
- [ ] Database user is created with proper permissions
- [ ] Network access is configured (0.0.0.0/0)
- [ ] Render service is created and configured
- [ ] Environment variables are set in Render
- [ ] Build and start commands are correct
- [ ] Deployment is successful and service is live
- [ ] API endpoints are tested
- [ ] Frontend API URL is updated
