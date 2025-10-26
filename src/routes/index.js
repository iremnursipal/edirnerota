const express = require('express');
const router = express.Router();

// Import controller functions
const { getAllItems, getItemById, createItem, updateItem, deleteItem } = require('../controllers/index');
const { register, login, forgotPassword, resetPassword } = require('../controllers/auth');
let debugController;
try {
	// optional debug controller (only required when file exists)
	debugController = require('../controllers/debug');
} catch (e) {
	debugController = null;
}
const { authenticate } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 6,
	message: { status: 'error', message: 'Çok fazla giriş denemesi, lütfen bir dakika sonra tekrar deneyin' }
});

// Items routes
router.get('/items', getAllItems);
router.get('/items/:id', getItemById);
router.post('/items', createItem);
router.put('/items/:id', updateItem);
router.delete('/items/:id', deleteItem);

// Auth routes
router.post(
	'/auth/register',
	[
		body('full_name').isLength({ min: 2 }).withMessage('Ad soyad en az 2 karakter olmalı'),
		body('email').isEmail().withMessage('Geçerli bir e-posta girin'),
		body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı'),
	],
	register
);

router.post('/auth/login', loginLimiter, [body('email').isEmail(), body('password').exists()], login);

// Şifre sıfırlama route'ları
router.post('/auth/forgot-password',
  [
    body('email').isEmail().withMessage('Geçerli bir e-posta adresi girin')
  ],
  forgotPassword
);

router.post('/auth/reset-password',
  [
    body('token').notEmpty().withMessage('Token gerekli'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Şifre en az 6 karakter olmalı')
  ],
  resetPassword
);

// protected example route
router.get('/auth/me', authenticate, (req, res) => {
	res.json({ status: 'success', user: req.user });
});

// Development-only debug routes (list users / tokens)
if (process.env.NODE_ENV !== 'production' && debugController) {
	router.get('/debug/users', debugController.listUsers);
	router.get('/debug/reset-tokens', debugController.listResetTokens);
}

module.exports = router;