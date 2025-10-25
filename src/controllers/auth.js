const { validationResult } = require('express-validator');
const { registerUser, loginUser } = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status: 'error', errors: errors.array() });

    const { full_name, email, password } = req.body;
    const user = await registerUser({ full_name, email, password });

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
    const { user, token } = await loginUser({ email, password });

    return res.json({ status: 'success', message: 'Giriş başarılı', token, user });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
};
