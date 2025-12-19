const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksiController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/fifo', isAuthenticated, transaksiController.getFifoPage);
router.post('/fifo/preview', isAuthenticated, transaksiController.previewFifo);
router.post('/fifo/process', isAuthenticated, transaksiController.processFifo);

module.exports = router;
