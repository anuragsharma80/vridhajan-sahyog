// const { findAdminByUsername } = require("../models/adminModel");

// const loginAdmin = async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     console.log("📩 Login attempt:", username, password);

//     const admin = await findAdminByUsername(username);
//     console.log("🔎 Found admin:", admin);
//     console.log("DB result:", admin);

//     if (!admin) {
//       return res.status(401).json({ message: "Invalid username or password" });
//     }

//     if (password !== admin.password) {
//       return res.status(401).json({ message: "Invalid username or password" });
//     }

//     res.json({ message: "Login successful" });
//   } catch (err) {
//     console.error("❌ Login error stack:", err.stack);
//     res.status(500).json({ message: "Server error", error: err.message });

//   }
// };

// module.exports = { loginAdmin };


const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "your_jwt_secret"; // later move this to config

// Admin login
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if admin exists
    const result = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const admin = result.rows[0];

    // Compare password with bcrypt hash
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};
