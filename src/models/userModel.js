const { getPool } = require('../config/veritabani');

/**
 * Basit user model helper - SQL sorguları
 */

const findUserByEmail = async (email) => {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0];
};

const createUser = async ({ full_name, email, password }) => {
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)',
    [full_name, email, password]
  );
  return { id: result.insertId, full_name, email };
};

const findUserById = async (id) => {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return rows[0];
};

const createPasswordResetToken = async (userId, token, expiresAt) => {
  const pool = getPool();
  await pool.query(
    'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [userId, token, expiresAt]
  );
};

const findValidPasswordResetToken = async (token) => {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT prt.*, u.email FROM password_reset_tokens prt ' +
    'JOIN users u ON u.id = prt.user_id ' +
    'WHERE prt.token = ? AND prt.expires_at > NOW() AND prt.used = 0 ' +
    'LIMIT 1',
    [token]
  );
  return rows[0];
};

const updateUserPassword = async (userId, newPassword) => {
  const pool = getPool();
  await pool.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId]);
};

const markTokenAsUsed = async (tokenId) => {
  const pool = getPool();
  await pool.query(
    'UPDATE password_reset_tokens SET used = 1 WHERE id = ?',
    [tokenId]
  );
};

const getAllUsers = async () => {
  const pool = getPool();
  const [rows] = await pool.query('SELECT id, full_name, email, created_at, updated_at FROM users');
  return rows;
};

const getAllResetTokens = async () => {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM password_reset_tokens ORDER BY created_at DESC');
  return rows;
};

module.exports = {
  findUserByEmail,
  createUser,
  findUserById,
  createPasswordResetToken,
  findValidPasswordResetToken,
  updateUserPassword,
  markTokenAsUsed,
  getAllUsers,
  getAllResetTokens,
};
