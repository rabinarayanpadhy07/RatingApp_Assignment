const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { validateUserData, validateStoreData } = require('../utils/validators');

// GET /api/admin/stats - Dashboard summary metrics
const getDashboardStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ totalStores }]] = await db.query('SELECT COUNT(*) AS totalStores FROM stores');
    const [[{ totalRatings }]] = await db.query('SELECT COUNT(*) AS totalRatings FROM ratings');

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers: Number(totalUsers) || 0,
        totalStores: Number(totalStores) || 0,
        totalRatings: Number(totalRatings) || 0
      }
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics.'
    });
  }
};

// GET /api/admin/stores - List stores with overall rating, filters, and sorting
const getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const allowedSortFields = {
      name: 's.name',
      email: 's.email',
      address: 's.address',
      rating: 'rating'
    };

    const sortField = allowedSortFields[sortBy.toLowerCase()] || 's.name';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        u.name AS owner_name,
        COALESCE(ROUND(AVG(r.rating), 2), 0) AS rating,
        COUNT(r.id) AS total_ratings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = [];

    if (name && name.trim()) {
      query += ` AND s.name LIKE ?`;
      params.push(`%${name.trim()}%`);
    }

    if (email && email.trim()) {
      query += ` AND s.email LIKE ?`;
      params.push(`%${email.trim()}%`);
    }

    if (address && address.trim()) {
      query += ` AND s.address LIKE ?`;
      params.push(`%${address.trim()}%`);
    }

    query += `
      GROUP BY s.id, s.name, s.email, s.address, s.owner_id, u.name
      ORDER BY ${sortField} ${order}
    `;

    const [stores] = await db.query(query, params);

    return res.status(200).json({
      success: true,
      stores: stores.map(store => ({
        ...store,
        rating: Number(store.rating) || 0,
        total_ratings: Number(store.total_ratings) || 0
      }))
    });
  } catch (error) {
    console.error('getStores error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve stores.'
    });
  }
};

// GET /api/admin/users - List users with role, rating (if store owner), filters, and sorting
const getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const allowedSortFields = {
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      role: 'u.role',
      rating: 'rating'
    };

    const sortField = allowedSortFields[sortBy.toLowerCase()] || 'u.name';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.address,
        u.role,
        u.created_at,
        s.name AS store_name,
        s.id AS store_id,
        CASE 
          WHEN u.role = 'STORE_OWNER' THEN COALESCE(ROUND(AVG(r.rating), 2), NULL)
          ELSE NULL 
        END AS rating,
        CASE 
          WHEN u.role = 'STORE_OWNER' THEN COUNT(r.id)
          ELSE 0 
        END AS total_store_ratings
      FROM users u
      LEFT JOIN stores s ON u.id = s.owner_id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = [];

    if (name && name.trim()) {
      query += ` AND u.name LIKE ?`;
      params.push(`%${name.trim()}%`);
    }

    if (email && email.trim()) {
      query += ` AND u.email LIKE ?`;
      params.push(`%${email.trim()}%`);
    }

    if (address && address.trim()) {
      query += ` AND u.address LIKE ?`;
      params.push(`%${address.trim()}%`);
    }

    if (role && role.trim()) {
      query += ` AND u.role = ?`;
      params.push(role.trim().toUpperCase());
    }

    query += `
      GROUP BY u.id, u.name, u.email, u.address, u.role, u.created_at, s.name, s.id
      ORDER BY ${sortField} ${order}
    `;

    const [users] = await db.query(query, params);

    return res.status(200).json({
      success: true,
      users: users.map(user => ({
        ...user,
        rating: user.rating !== null ? Number(user.rating) : null,
        total_store_ratings: Number(user.total_store_ratings) || 0
      }))
    });
  } catch (error) {
    console.error('getUsers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users.'
    });
  }
};

// POST /api/admin/users - Admin can add new normal, admin, or store owner users
const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role = 'USER' } = req.body;

    const allowedRoles = ['USER', 'ADMIN', 'STORE_OWNER'];
    const assignedRole = role.toUpperCase();

    if (!allowedRoles.includes(assignedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Role must be USER, ADMIN, or STORE_OWNER.'
      });
    }

    const validation = validateUserData({ name, email, password, address });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: validation.errors
      });
    }

    // Check if email already in use
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashedPassword, address.trim(), assignedRole]
    );

    return res.status(201).json({
      success: true,
      message: `${assignedRole === 'ADMIN' ? 'Admin' : assignedRole === 'STORE_OWNER' ? 'Store Owner' : 'Normal'} user created successfully.`,
      user: {
        id: result.insertId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        role: assignedRole
      }
    });
  } catch (error) {
    console.error('createUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user.'
    });
  }
};

// POST /api/admin/stores - Admin can add new stores
const createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const validation = validateStoreData({ name, email, address });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: validation.errors
      });
    }

    // Check if store email exists
    const [existing] = await db.query('SELECT id FROM stores WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A store with this email address already exists.'
      });
    }

    // If ownerId is provided, verify user exists and is a STORE_OWNER
    let assignedOwnerId = null;
    if (ownerId) {
      const [ownerRows] = await db.query('SELECT id, role FROM users WHERE id = ?', [ownerId]);
      if (ownerRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Selected store owner does not exist.'
        });
      }
      if (ownerRows[0].role !== 'STORE_OWNER') {
        return res.status(400).json({
          success: false,
          message: 'Selected user is not registered as a Store Owner.'
        });
      }

      // Check if this owner already owns a store
      const [existingStoreForOwner] = await db.query('SELECT id FROM stores WHERE owner_id = ?', [ownerId]);
      if (existingStoreForOwner.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'This user is already assigned to another store.'
        });
      }

      assignedOwnerId = ownerId;
    }

    const [result] = await db.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), address.trim(), assignedOwnerId]
    );

    return res.status(201).json({
      success: true,
      message: 'Store added successfully.',
      store: {
        id: result.insertId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        owner_id: assignedOwnerId
      }
    });
  } catch (error) {
    console.error('createStore error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create store.'
    });
  }
};

// GET /api/admin/available-owners - Store owners available for assignment
const getAvailableOwners = async (req, res) => {
  try {
    const [owners] = await db.query(`
      SELECT u.id, u.name, u.email 
      FROM users u
      LEFT JOIN stores s ON u.id = s.owner_id
      WHERE u.role = 'STORE_OWNER' AND s.id IS NULL
      ORDER BY u.name ASC
    `);

    return res.status(200).json({
      success: true,
      owners
    });
  } catch (error) {
    console.error('getAvailableOwners error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch available store owners.'
    });
  }
};

module.exports = {
  getDashboardStats,
  getStores,
  getUsers,
  createUser,
  createStore,
  getAvailableOwners
};
