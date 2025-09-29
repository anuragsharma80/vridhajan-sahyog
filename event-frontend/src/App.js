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
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/dashboard';
  const isAuthenticatedPage = !(location.pathname === '/login' || location.pathname === '/register');

  return (
    <>
      {!hideNavbar && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/member-entry" element={<MemberEntry />} />
        <Route path="/member-list" element={<MemberList />} />
        <Route path="/member-profile/:daniMemberNo" element={<MemberProfile />} />
        <Route path="/receipt-entry" element={<ReceiptEntry />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
