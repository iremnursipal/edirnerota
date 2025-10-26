-- Migration: Create password_reset_tokens table
-- Bu migration şifre sıfırlama token'larını saklamak için ayrı bir tablo oluşturur
-- Avantajlar: çoklu token, geçmiş takibi, otomatik temizlik

USE edirne_rota_db;

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


-- ALTER TABLE users DROP COLUMN IF EXISTS reset_token;
-- ALTER TABLE users DROP COLUMN IF EXISTS reset_token_expires;
