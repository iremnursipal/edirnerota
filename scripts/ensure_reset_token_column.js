const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'edirne_rota_db',
  });

  try {
    console.log('Connected to DB - checking password_reset_tokens schema...');

    // Check if column 'used' exists
    const [cols] = await conn.query("SHOW COLUMNS FROM password_reset_tokens LIKE 'used'");
    if (cols.length === 0) {
      console.log("'used' column not found. Adding column used TINYINT(1) DEFAULT 0...");
      await conn.query("ALTER TABLE password_reset_tokens ADD COLUMN used TINYINT(1) DEFAULT 0;");
    } else {
      console.log("'used' column already exists.");
    }

    console.log('Done.');
  } catch (err) {
    console.error('Error while checking/altering table:', err.message || err);
    process.exit(1);
  } finally {
    await conn.end();
  }
})();
