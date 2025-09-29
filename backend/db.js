const { Pool } = require("pg");

// Direct credentials (no .env for now)
const pool = new Pool({
  user: "postgres",        // replace with your DB username
  host: "localhost",
  database: "vridhajan_sahyog",   // database we just created
  password: "admin", // replace with your PostgreSQL password
  port: 5432,
});

module.exports = pool;
