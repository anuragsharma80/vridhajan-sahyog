const bcrypt = require("bcrypt");

async function hashPassword() {
  const plainPassword = "admin123";
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  console.log("Hashed password:", hashedPassword);
}

hashPassword();
