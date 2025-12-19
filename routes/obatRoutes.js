const express = require('express');
const router = express.Router();
const obatController = require('../controllers/obatController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/input', isAuthenticated, obatController.getInputPage);
router.post('/input', isAuthenticated, obatController.addObat);
router.get('/list', isAuthenticated, obatController.getList);
router.get('/api/:id/detail', isAuthenticated, obatController.getBatchDetails);

module.exports = router;
