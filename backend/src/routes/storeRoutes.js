const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const authenticateToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.get('/', storeController.getStoresForUser);
router.post('/:storeId/rating', requireRole('USER'), storeController.submitOrUpdateRating);

module.exports = router;
