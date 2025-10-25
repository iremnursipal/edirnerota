const jwt = require('jsonwebtoken');
const { findUserById } = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

const authenticate = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ status: 'error', message: 'Token gerekli' });

    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(decoded.id);
    if (!user) return res.status(401).json({ status: 'error', message: 'Geçersiz token' });

    req.user = { id: user.id, full_name: user.full_name, email: user.email };
    next();
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'Geçersiz token' });
  }
};

module.exports = { authenticate };
