import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import "./Login.css";

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    phoneNumber: "",
    password: ""
  });
  const [loginMethod, setLoginMethod] = useState("username"); // "username" or "phone"
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated) {
      // If user is already authenticated, redirect to the page they were trying to access
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loginData = {
        password: formData.password
      };
      
      if (loginMethod === "username") {
        loginData.username = formData.username;
      } else {
        loginData.phoneNumber = formData.phoneNumber;
      }
      
      const result = await login(loginData);
      
      if (result.success) {
        toast.success("Login successful!");
        // Redirect to the page they were trying to access, or dashboard
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        toast.error(result.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <h1>🕉️ Vridhajan Sahyog</h1>
            <p>Donation Management System</p>
          </div>
        </div>

        <div className="login-form-container">
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Sign in to your account</p>

          <form onSubmit={handleLogin} className="login-form">
            <div className="login-method-toggle">
              <button
                type="button"
                className={`toggle-button ${loginMethod === "username" ? "active" : ""}`}
                onClick={() => setLoginMethod("username")}
                disabled={loading}
              >
                Username
              </button>
              <button
                type="button"
                className={`toggle-button ${loginMethod === "phone" ? "active" : ""}`}
                onClick={() => setLoginMethod("phone")}
                disabled={loading}
              >
                Phone Number
              </button>
            </div>

            <div className="form-group">
              <label htmlFor={loginMethod === "username" ? "username" : "phoneNumber"}>
                {loginMethod === "username" ? "Username" : "Phone Number"}
              </label>
              <input
                type={loginMethod === "username" ? "text" : "tel"}
                id={loginMethod === "username" ? "username" : "phoneNumber"}
                name={loginMethod === "username" ? "username" : "phoneNumber"}
                value={loginMethod === "username" ? formData.username : formData.phoneNumber}
                onChange={handleInputChange}
                placeholder={loginMethod === "username" ? "Enter your username" : "Enter your 10-digit phone number"}
                required
                disabled={loading}
                maxLength={loginMethod === "phone" ? "10" : undefined}
                pattern={loginMethod === "phone" ? "[0-9]{10}" : undefined}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="login-footer">
            <div className="register-link">
              <p>Don't have an account? <Link to="/register">Register with Phone Number</Link></p>
            </div>
          </div>
        </div>

        <div className="login-inspiration">
          <div className="inspiration-content">
            <h3>🙏 Serving the Community</h3>
            <p>
              "The best way to find yourself is to lose yourself in the service of others."
            </p>
            <p className="quote-author">- Mahatma Gandhi</p>
          </div>
        </div>
      </div>
    </div>
  );
}
