# Vridhajan Sahyog - Donation Management System

A complete MERN stack application for managing donations, members, and receipts for the Vridhajan Sahyog organization.

## 🚀 Features

- **User Authentication**: Secure login with JWT tokens
- **Member Management**: Add, search, and manage member information
- **Receipt Entry**: Record donations with member linking
- **Top Donors Dashboard**: View top donors by month/year with filtering
- **Responsive Design**: Modern, mobile-friendly interface
- **Real-time Data**: Live updates and notifications

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **CSS3** - Styling

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Vridhajan-Sahyog
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd event-frontend
npm install
```

### 3. Database Setup

**Option A: Local MongoDB**
1. Install MongoDB Community Server
2. Start MongoDB service
3. Create database: `vridhajan-sahyog`

**Option B: MongoDB Atlas (Recommended)**
1. Create account at https://www.mongodb.com/atlas
2. Create a free cluster
3. Get connection string

### 4. Environment Configuration

Create `.env` file in `backend` directory:
```env
# Database Configuration
DATABASE_URI=mongodb://localhost:27017/vridhajan-sahyog
# OR for MongoDB Atlas:
# DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/vridhajan-sahyog

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 5. Seed Database

Create default admin user:
```bash
cd backend
npm run seed
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

### 6. Start the Application

**Development Mode (Both Frontend & Backend):**
```bash
# From root directory
npm run dev
```

**Or start separately:**

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd event-frontend
npm start
```

## 🌐 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Members
- `GET /api/members/next-reg-no` - Get next registration number
- `POST /api/members` - Create new member
- `GET /api/members/search?query=searchTerm` - Search members
- `GET /api/members/:universalKey` - Get member details

### Receipts
- `POST /api/receipts` - Create new receipt
- `GET /api/receipts/member/:universalKey` - Get member's receipts

### Donors
- `GET /api/donors/top?year=2024&month=1` - Get top donors

## 🗂️ Project Structure

```
Vridhajan-Sahyog/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── env.example
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── memberController.js
│   │   ├── receiptController.js
│   │   └── donorController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── memberModel.js
│   │   └── receiptModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── memberRoutes.js
│   │   ├── receiptRoutes.js
│   │   └── donorRoutes.js
│   ├── scripts/
│   │   └── seed.js
│   ├── server.js
│   └── package.json
├── event-frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── MemberEntry.js
│   │   │   ├── ReceiptEntry.js
│   │   │   └── TopDonors.js
│   │   ├── api.js
│   │   └── App.js
│   └── package.json
└── README.md
```

## 🔐 Authentication

The application uses JWT-based authentication:
- Login with username/password
- JWT token stored in localStorage
- Protected routes require valid token
- Automatic logout on token expiration

## 📊 Database Schema

### User
- `username` (String, unique)
- `password` (String, hashed)

### Member
- `universalKey` (String, unique, auto-generated)
- `regNo` (Number, unique)
- `memberName` (String)
- `address` (Object with city, state, pincode)
- `contact` (Object with phone, email)
- `personal` (Object with occupation, DOB)
- `spiritual` (Object with diksha details)
- `membership` (Object with registration details)

### Receipt
- `receiptNo` (String, unique)
- `amount` (Number)
- `receiptDate` (Date)
- `paymentMode` (String: Cash/Cheque/Online)
- `member` (ObjectId reference to Member)

## 🎨 Frontend Features

### Member Entry Form
- Auto-generated registration numbers
- Indian states dropdown
- Pincode-based city/state auto-fill
- Comprehensive member information

### Receipt Entry Form
- Member search functionality
- Previous donation history
- Multiple payment modes
- Receipt number generation

### Top Donors Dashboard
- Monthly/Yearly filtering
- Real-time statistics
- Donor ranking system
- Export capabilities

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check DATABASE_URI in .env file
   - Verify network connectivity

2. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing processes on ports 3000/5000

3. **JWT Token Issues**
   - Clear localStorage
   - Check JWT_SECRET in .env
   - Verify token expiration

4. **CORS Errors**
   - Check FRONTEND_URL in .env
   - Verify backend CORS configuration

## 🔄 Development Workflow

1. Make changes to backend/frontend
2. Backend auto-restarts with nodemon
3. Frontend hot-reloads with React
4. Test API endpoints with Postman/Thunder Client
5. Check browser console for errors

## 📝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review API documentation
- Check browser console for errors
- Verify database connectivity

---

**Happy Coding! 🎉**
