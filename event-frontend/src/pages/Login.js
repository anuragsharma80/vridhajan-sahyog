import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
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

  // Check if user is already logged in
  useEffect(() => {
    // With HttpOnly cookies, we can't check token existence on client side
    // The API interceptor will handle authentication
    // For now, we'll let the user access the login page
  }, [navigate]);

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
      
      const response = await API.post("/auth/login", loginData);
      
      if (response.data.success) {
        // Tokens are now stored in secure HttpOnly cookies
        // No need to store token in localStorage for new secure system
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
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
