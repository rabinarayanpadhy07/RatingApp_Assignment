const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const authenticateToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(authenticateToken, requireRole('STORE_OWNER'));

router.get('/dashboard', ownerController.getOwnerDashboard);

module.exports = router;
