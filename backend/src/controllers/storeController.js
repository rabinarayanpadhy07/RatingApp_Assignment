const db = require('../config/db');

// GET /api/stores - List stores for Normal User with overall rating & user's submitted rating
const getStoresForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search, name, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const allowedSortFields = {
      name: 's.name',
      address: 's.address',
      overall_rating: 'overall_rating',
      user_rating: 'user_rating'
    };

    const sortField = allowedSortFields[sortBy.toLowerCase()] || 's.name';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        COALESCE(ROUND(AVG(all_ratings.rating), 2), 0) AS overall_rating,
        COUNT(all_ratings.id) AS total_ratings,
        my_rating.rating AS user_rating,
        my_rating.updated_at AS user_rating_date
      FROM stores s
      LEFT JOIN ratings all_ratings ON s.id = all_ratings.store_id
      LEFT JOIN ratings my_rating ON s.id = my_rating.store_id AND my_rating.user_id = ?
      WHERE 1=1
    `;
    const params = [userId];

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ` AND (s.name LIKE ? OR s.address LIKE ?)`;
      params.push(term, term);
    } else {
      if (name && name.trim()) {
        query += ` AND s.name LIKE ?`;
        params.push(`%${name.trim()}%`);
      }
      if (address && address.trim()) {
        query += ` AND s.address LIKE ?`;
        params.push(`%${address.trim()}%`);
      }
    }

    query += `
      GROUP BY s.id, s.name, s.email, s.address, my_rating.rating, my_rating.updated_at
      ORDER BY ${sortField} ${order}
    `;

    const [stores] = await db.query(query, params);

    return res.status(200).json({
      success: true,
      stores: stores.map(store => ({
        ...store,
        overall_rating: Number(store.overall_rating) || 0,
        total_ratings: Number(store.total_ratings) || 0,
        user_rating: store.user_rating !== null ? Number(store.user_rating) : null
      }))
    });
  } catch (error) {
    console.error('getStoresForUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve store listings.'
    });
  }
};

// POST /api/stores/:storeId/rating - Submit or modify a rating (1 to 5)
const submitOrUpdateRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const storeId = parseInt(req.params.storeId, 10);
    const rating = parseInt(req.body.rating, 10);

    if (isNaN(storeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid store identifier.'
      });
    }

    if (isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.'
      });
    }

    // Verify store exists
    const [storeRows] = await db.query('SELECT id, name FROM stores WHERE id = ?', [storeId]);
    if (storeRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.'
      });
    }

    // Check if user has an existing rating for this store
    const [existingRating] = await db.query(
      'SELECT id, rating FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    const isModification = existingRating.length > 0;

    // Insert or update rating
    await db.query(`
      INSERT INTO ratings (user_id, store_id, rating)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE rating = VALUES(rating), updated_at = CURRENT_TIMESTAMP
    `, [userId, storeId, rating]);

    // Calculate new overall store rating
    const [[stats]] = await db.query(`
      SELECT 
        COALESCE(ROUND(AVG(rating), 2), 0) AS overall_rating,
        COUNT(id) AS total_ratings
      FROM ratings
      WHERE store_id = ?
    `, [storeId]);

    return res.status(200).json({
      success: true,
      message: isModification ? 'Your rating has been updated successfully.' : 'Rating submitted successfully!',
      rating: {
        storeId,
        userRating: rating,
        isModification,
        overallRating: Number(stats.overall_rating) || 0,
        totalRatings: Number(stats.total_ratings) || 0
      }
    });
  } catch (error) {
    console.error('submitOrUpdateRating error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit rating.'
    });
  }
};

module.exports = {
  getStoresForUser,
  submitOrUpdateRating
};
