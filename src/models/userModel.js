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

module.exports = {
  findUserByEmail,
  createUser,
  findUserById,
};
