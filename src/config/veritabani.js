// MySQL veritabanı bağlantı ayarları
// Kullanım: const { pool, initDB } = require('../config/veritabani');
const mysql = require('mysql2/promise');

let pool;

const initDB = async () => {
  try {
    if (!pool) {
      pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'edirne_rota_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      });

      // Pool error handling
      pool.on('error', async (err) => {
        console.error('Unexpected pool error:', err);
        try {
          await closeDB();
          await initDB(); // Try to reinitialize the pool
        } catch (reinitError) {
          console.error('Failed to reinitialize pool:', reinitError);
        }
      });

      // Test connection
      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();
      
      console.log('MySQL veritabanına başarıyla bağlanıldı');
    }
  } catch (error) {
    console.error('MySQL bağlantı hatası:', error);
    throw error; // Let the application handle the error instead of exiting
  }
};

const closeDB = async () => {
  if (pool) {
    try {
      await pool.end();
      pool = null; // Reset the pool reference
      console.log('MySQL bağlantısı kapatıldı');
    } catch (err) {
      console.error('MySQL kapatma hatası:', err);
      pool = null; // Reset even on error
      throw err;
    }
  }
};

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await closeDB();
  process.exit(0);
});

module.exports = {
  initDB,
  getPool: () => pool,
  closeDB,
};
