const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(authenticateToken, requireRole('ADMIN'));

router.get('/stats', adminController.getDashboardStats);
router.get('/stores', adminController.getStores);
router.get('/users', adminController.getUsers);
router.post('/stores', adminController.createStore);
router.post('/users', adminController.createUser);
router.get('/available-owners', adminController.getAvailableOwners);

module.exports = router;
