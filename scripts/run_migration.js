/**
 * Migration script: password_reset_tokens tablosunu oluşturur
 * Kullanım: node scripts/run_migration.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function runMigration() {
  let connection;
  try {
    // Veritabanı bağlantısı oluştur
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'edirne_rota_db',
    });

    console.log('✓ MySQL bağlantısı kuruldu');

    // password_reset_tokens tablosunu oluştur
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        used TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_token (token),
        INDEX idx_user_id (user_id),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createTableSQL);
    console.log('✓ password_reset_tokens tablosu oluşturuldu (veya zaten mevcut)');

    // Tabloyu doğrula
    const [rows] = await connection.execute('SHOW TABLES LIKE "password_reset_tokens"');
    if (rows.length > 0) {
      console.log('✓ Tablo doğrulandı');
      
      // Kolonları göster
      const [columns] = await connection.execute('DESCRIBE password_reset_tokens');
      console.log('\nTablo yapısı:');
      columns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key ? `[${col.Key}]` : ''}`);
      });
    }

    console.log('\n✅ Migration başarıyla tamamlandı!');
  } catch (error) {
    console.error('❌ Migration hatası:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✓ Bağlantı kapatıldı');
    }
  }
}

runMigration();
