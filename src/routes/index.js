const express = require('express');
const router = express.Router();

// Import controller functions
const { getAllItems, getItemById, createItem, updateItem, deleteItem } = require('../controllers/index');
const { register, login } = require('../controllers/auth');
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

module.exports = router;