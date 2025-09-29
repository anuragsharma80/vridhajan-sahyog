const pool = require("../db");

const findAdminByUsername = async (username) => {
  console.log("📡 Querying DB for username:", username);
  const result = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);
  return result.rows[0];
};

module.exports = { findAdminByUsername };
