# 🚀 Quick Start Guide - Vridhajan Sahyog

## ✅ **Step 1: Start MongoDB**

### **Method 1: Using Services (Easiest)**
1. Press `Windows + R`
2. Type `services.msc` and press Enter
3. Find "MongoDB" in the list
4. Right-click → "Start"

### **Method 2: Command Line (As Administrator)**
1. Right-click PowerShell → "Run as administrator"
2. Run: `net start MongoDB`

### **Method 3: Manual Start**
1. Navigate to: `C:\Program Files\MongoDB\Server\7.0\bin\`
2. Double-click `mongod.exe`

## ✅ **Step 2: Create .env File**

Create `backend/.env` with:
```env
DATABASE_URI=mongodb://localhost:27017/vridhajan-sahyog
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:3000
```

## ✅ **Step 3: Test MongoDB Connection**

```bash
node test-mongodb.js
```

You should see: `✅ MongoDB connected successfully!`

## ✅ **Step 4: Start the Application**

```bash
npm run dev
```

## ✅ **Step 5: Access Your Application**

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Login**: Username: `admin`, Password: `admin123`

## 🔧 **Troubleshooting**

### **MongoDB Connection Error**
- Make sure MongoDB service is running
- Check if port 27017 is available
- Verify .env file exists in backend folder

### **Port Already in Use**
- Kill processes on ports 3000/5000
- Or change ports in .env file

### **Permission Errors**
- Run PowerShell as Administrator
- Check MongoDB installation path

## 🎯 **What You Can Do**

1. **Login** with admin credentials
2. **Add Members** with complete information
3. **Record Donations** and link to members
4. **View Top Donors** with filtering
5. **Search Members** by various criteria

## 📱 **Features Available**

- ✅ User Authentication (JWT)
- ✅ Member Management
- ✅ Receipt Entry
- ✅ Top Donors Dashboard
- ✅ Indian Address Support
- ✅ Pincode Lookup
- ✅ Responsive Design

---

**🎉 Your donation management system is ready to use!**
