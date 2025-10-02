import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MemberEntry from "./pages/MemberEntry";
import MemberList from "./pages/MemberList";
import MemberProfile from "./pages/MemberProfile";
import ReceiptEntry from "./pages/ReceiptEntry";
import Reports from "./pages/TopDonors";
import Navbar from "./components/Navbar";
import SessionTimeout from "./components/SessionTimeout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/dashboard';
  const isAuthenticatedPage = !(location.pathname === '/login' || location.pathname === '/register');

  console.log('🚀 AppContent rendering, location:', location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/member-entry" element={
          <ProtectedRoute>
            <MemberEntry />
          </ProtectedRoute>
        } />
        <Route path="/member-list" element={
          <ProtectedRoute>
            <MemberList />
          </ProtectedRoute>
        } />
        <Route path="/member-profile/:daniMemberNo" element={
          <ProtectedRoute>
            <MemberProfile />
          </ProtectedRoute>
        } />
        <Route path="/receipt-entry" element={
          <ProtectedRoute>
            <ReceiptEntry />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } />
      </Routes>

      {/* Session Timeout Component - only show on authenticated pages */}
      {isAuthenticatedPage && <SessionTimeout />}

      {/* Toast notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
