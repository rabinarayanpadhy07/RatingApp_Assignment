const db = require('../config/db');

// GET /api/owner/dashboard - Store Owner Dashboard data
const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { sortBy = 'date', sortOrder = 'DESC' } = req.query;

    // Fetch the store owned by this user
    const [stores] = await db.query(
      'SELECT id, name, email, address, created_at FROM stores WHERE owner_id = ?',
      [ownerId]
    );

    if (stores.length === 0) {
      return res.status(200).json({
        success: true,
        hasStore: false,
        message: 'No store has been assigned to your account yet. Please contact the administrator.',
        store: null,
        stats: {
          averageRating: 0,
          totalRatings: 0
        },
        ratedUsers: []
      });
    }

    const store = stores[0];

    // Compute average rating and count
    const [[stats]] = await db.query(`
      SELECT 
        COALESCE(ROUND(AVG(rating), 2), 0) AS average_rating,
        COUNT(id) AS total_ratings
      FROM ratings
      WHERE store_id = ?
    `, [store.id]);

    // Sorting for rated users table
    const allowedSortFields = {
      name: 'u.name',
      email: 'u.email',
      rating: 'r.rating',
      date: 'r.updated_at'
    };

    const sortField = allowedSortFields[sortBy.toLowerCase()] || 'r.updated_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [ratedUsers] = await db.query(`
      SELECT 
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.address AS user_address,
        r.rating,
        r.created_at,
        r.updated_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY ${sortField} ${order}
    `, [store.id]);

    return res.status(200).json({
      success: true,
      hasStore: true,
      store,
      stats: {
        averageRating: Number(stats.average_rating) || 0,
        totalRatings: Number(stats.total_ratings) || 0
      },
      ratedUsers: ratedUsers.map(row => ({
        ...row,
        rating: Number(row.rating)
      }))
    });
  } catch (error) {
    console.error('getOwnerDashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve store owner dashboard.'
    });
  }
};

module.exports = {
  getOwnerDashboard
};
