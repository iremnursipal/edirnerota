const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findUserByEmail, createUser } = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

const { validationResult } = require('express-validator');

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status: 'error', errors: errors.array() });

    const { full_name, email, password } = req.body;

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Bu e-posta zaten kullanılıyor' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await createUser({ full_name, email, password: hashed });

    return res.status(201).json({ status: 'success', message: 'Kullanıcı oluşturuldu', user });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status: 'error', errors: errors.array() });

    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ message: 'Geçersiz kimlik bilgileri' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Geçersiz kimlik bilgileri' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({ status: 'success', message: 'Giriş başarılı', token, user: { id: user.id, full_name: user.full_name, email: user.email } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
};
