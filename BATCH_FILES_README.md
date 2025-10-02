# 🚀 Windows Batch Files for Vridhajan Sahyog

This directory contains Windows Batch files (.bat) that make it easy to start your development servers with a simple double-click.

## 📁 Available Batch Files

### 1. `start-project.bat` (Recommended)
**Interactive menu with multiple options**
- Double-click to open an interactive menu
- Choose from multiple options:
  - Start Full Development Server (Backend + Frontend)
  - Start Backend Only
  - Start Frontend Only
  - Install Dependencies
  - Exit

### 2. `start-dev.bat`
**Quick start for full development server**
- Starts both backend and frontend servers simultaneously
- Automatically installs dependencies if needed
- Backend runs on: http://localhost:5000
- Frontend runs on: http://localhost:3000

### 3. `start-backend.bat`
**Backend server only**
- Starts only the Node.js backend server
- Runs on: http://localhost:5000
- Useful for API development and testing

### 4. `start-frontend.bat`
**Frontend server only**
- Starts only the React frontend server
- Runs on: http://localhost:3000
- Useful for UI development

## 🎯 How to Use

### Quick Start (Recommended)
1. **Double-click `start-project.bat`**
2. **Choose option 1** (Start Full Development Server)
3. **Wait for both servers to start**
4. **Open your browser** to http://localhost:3000

### Alternative Quick Start
1. **Double-click `start-dev.bat`**
2. **Wait for both servers to start**
3. **Open your browser** to http://localhost:3000

## 🔧 Features

### Automatic Dependency Installation
- All batch files check if `node_modules` exists
- If not found, they automatically run `npm install`
- No need to manually install dependencies

### Error Handling
- Checks for required files (`package.json`)
- Shows clear error messages if something goes wrong
- Pauses on errors so you can read the messages

### Color-Coded Windows
- Each batch file opens with a different color
- Easy to identify which server is running
- Green: Full development server
- Blue: Backend only
- Red: Frontend only
- White: Interactive menu

## 📋 Prerequisites

Before using these batch files, make sure you have:

1. **Node.js installed** (version 14 or higher)
2. **npm installed** (comes with Node.js)
3. **MongoDB running** (for backend functionality)
4. **All project files** in the correct directory structure

## 🛠️ Troubleshooting

### "package.json not found" Error
- Make sure the batch file is in the project root directory
- Check that you have the complete project structure

### "Failed to install dependencies" Error
- Check your internet connection
- Make sure Node.js and npm are properly installed
- Try running `npm install` manually in the terminal

### "Port already in use" Error
- Close any existing servers running on ports 3000 or 5000
- Use Task Manager to end Node.js processes if needed
- Restart the batch file

### MongoDB Connection Issues
- Make sure MongoDB is running on your system
- Check your `.env` file in the backend directory
- Verify the MongoDB connection string

## 🎨 Customization

You can modify these batch files to:
- Change the colors (modify the `color` command)
- Add additional commands
- Change the window titles
- Add more options to the menu

## 📝 Notes

- **First time setup**: The batch files will automatically install dependencies
- **Subsequent runs**: They will start immediately
- **Stopping servers**: Press `Ctrl+C` in the command window
- **Multiple instances**: You can run different batch files simultaneously

## 🚀 Quick Commands

If you prefer using the command line directly:

```bash
# Start full development server
npm run dev

# Start backend only
cd backend && npm start

# Start frontend only
cd event-frontend && npm start

# Install all dependencies
npm run install-all
```

---

**Happy coding! 🎉**

