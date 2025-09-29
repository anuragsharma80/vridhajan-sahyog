// middleware/auth.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Try to get token from cookie first (new secure method)
  let token = req.cookies.accessToken;
  
  // Fallback to Authorization header for backward compatibility
  if (!token) {
    token = req.header("Authorization")?.split(" ")[1]; // Expect "Bearer <token>"
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "Access denied. No token provided." 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production');
    req.user = decoded; // attach user data to request
    next();
  } catch (err) {
    res.status(401).json({ 
      success: false,
      message: "Invalid or expired token." 
    });
  }
};
