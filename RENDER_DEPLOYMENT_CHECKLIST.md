# 🚀 Render Deployment Checklist

## Your Generated JWT Secrets (Keep These Secure!)

```
JWT_ACCESS_SECRET=9adf897b9338b54a29ea1314587c5fa8cadf54cd2902446ef93a5c39cab0c017427e659035579ab10afafd01a337623501f9661d11876a3119b379dfde678d02
JWT_REFRESH_SECRET=da65a2c03daa8d38057341df002d05af9a20833c6dfa988d075590d531d0d9f594501724bf706c372811555185f4aa546bc2ae4a872bffc42c6c1f0ebecfaf89
```

## Step-by-Step Deployment Process

### 1. MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account
- [ ] Create free M0 cluster
- [ ] Create database user with read/write permissions
- [ ] Configure network access (0.0.0.0/0)
- [ ] Get connection string
- [ ] Replace `<password>` and `<dbname>` in connection string

### 2. GitHub Repository
- [ ] Push your code to GitHub
- [ ] Ensure all files are committed
- [ ] Verify backend folder structure is correct

### 3. Render Setup
- [ ] Create Render account
- [ ] Connect GitHub repository
- [ ] Create new Web Service

### 4. Render Configuration
**Basic Settings:**
- [ ] Name: `vridhajan-sahyog-backend`
- [ ] Environment: `Node`
- [ ] Root Directory: `backend`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`

**Environment Variables:**
- [ ] `MONGODB_URI` = your MongoDB Atlas connection string
- [ ] `JWT_ACCESS_SECRET` = (use the generated secret above)
- [ ] `JWT_REFRESH_SECRET` = (use the generated secret above)
- [ ] `PORT` = `5000`
- [ ] `NODE_ENV` = `production`
- [ ] `FRONTEND_URL` = `https://your-frontend-domain.com` (update when you deploy frontend)

### 5. Deploy
- [ ] Click "Create Web Service"
- [ ] Wait for deployment to complete
- [ ] Check logs for any errors
- [ ] Test API endpoints

### 6. Test Your Deployment
- [ ] Visit your Render service URL
- [ ] Test health endpoint: `https://your-service.onrender.com/`
- [ ] Test API endpoints
- [ ] Verify database connection

### 7. Update Frontend
- [ ] Update API base URL in frontend
- [ ] Deploy frontend
- [ ] Test complete application

## Your Render Service URL
After deployment, your backend will be available at:
```
https://your-service-name.onrender.com
```

## Environment Variables Summary
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
JWT_ACCESS_SECRET=9adf897b9338b54a29ea1314587c5fa8cadf54cd2902446ef93a5c39cab0c017427e659035579ab10afafd01a337623501f9661d11876a3119b379dfde678d02
JWT_REFRESH_SECRET=da65a2c03daa8d38057341df002d05af9a20833c6dfa988d075590d531d0d9f594501724bf706c372811555185f4aa546bc2ae4a872bffc42c6c1f0ebecfaf89
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

## Troubleshooting
- Check Render logs for errors
- Verify all environment variables are set
- Ensure MongoDB Atlas connection string is correct
- Check that all dependencies are in package.json
