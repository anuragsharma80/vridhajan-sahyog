
// const { Pool } = require("pg");

// const pool = new Pool({
//   user: "postgres",          // your postgres username
//   host: "localhost",
//   database: "vridhajan_sahyog", // your DB name
//   password: "admin", // replace with your postgres password
//   port: 5432,
// });

// pool.connect()
//   .then(() => console.log("✅ Connected to PostgreSQL"))
//   .catch(err => console.error("❌ PostgreSQL connection error", err));

// module.exports = pool;



const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("vridhajan_sahyog", "postgres", "admin", {
  host: "localhost",
  dialect: "postgres",
});

sequelize.authenticate()
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ Error: " + err));

module.exports = sequelize;
