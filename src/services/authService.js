const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findUserByEmail, createUser, findUserById } = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

const registerUser = async ({ full_name, email, password }) => {
  const existing = await findUserByEmail(email);
  if (existing) throw { status: 409, message: 'Bu e-posta zaten kullanılıyor' };

  const hashed = await bcrypt.hash(password, 10);
  const user = await createUser({ full_name, email, password: hashed });
  return user;
};

const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) throw { status: 401, message: 'Geçersiz kimlik bilgileri' };

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw { status: 401, message: 'Geçersiz kimlik bilgileri' };

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  return { user: { id: user.id, full_name: user.full_name, email: user.email }, token };
};

const getUserProfile = async (id) => {
  const user = await findUserById(id);
  if (!user) throw { status: 404, message: 'Kullanıcı bulunamadı' };
  return { id: user.id, full_name: user.full_name, email: user.email };
};

module.exports = { registerUser, loginUser, getUserProfile };
