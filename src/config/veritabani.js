// MySQL veritabanı bağlantı ayarları
// Kullanım: const { pool, initDB } = require('../config/veritabani');
const mysql = require('mysql2/promise');

let pool;

const initDB = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'edirne_rota_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Basit bir bağlantı testi
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();

    console.log('MySQL veritabanına başarıyla bağlanıldı');
  } catch (error) {
    console.error('MySQL bağlantı hatası:', error);
    process.exit(1);
  }
};

module.exports = {
  initDB,
  getPool: () => pool,
};
