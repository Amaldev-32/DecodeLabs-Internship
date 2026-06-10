const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authMiddleware, sellerController.registerSeller);
router.get('/profile', authMiddleware, sellerController.getSellerProfile);

module.exports = router;
