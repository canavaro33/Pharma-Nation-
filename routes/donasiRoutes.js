const express = require('express');
const router = express.Router();
const donasiController = require('../controllers/donasiController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, donasiController.getIndex);
router.post('/', isAuthenticated, donasiController.processDonation);
router.post('/update-status', isAuthenticated, donasiController.updateStatus);

module.exports = router;
