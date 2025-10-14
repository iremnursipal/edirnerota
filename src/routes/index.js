const express = require('express');
const router = express.Router();

// Import controller functions
const { getAllItems, getItemById, createItem, updateItem, deleteItem } = require('../controllers/index');

// Define routes
router.get('/items', getAllItems);
router.get('/items/:id', getItemById);
router.post('/items', createItem);
router.put('/items/:id', updateItem);
router.delete('/items/:id', deleteItem);

// Export the router
module.exports = router;