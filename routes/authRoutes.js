const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isGuest } = require('../middleware/auth');

router.get('/login', isGuest, authController.getLoginPage);
router.post('/login', isGuest, authController.login);
router.get('/logout', authController.logout);

module.exports = router;
