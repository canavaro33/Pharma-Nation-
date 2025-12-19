const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporanController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/stock', isAuthenticated, laporanController.getStockReport);
router.get('/expiry', isAuthenticated, laporanController.getExpiryReport);

module.exports = router;
