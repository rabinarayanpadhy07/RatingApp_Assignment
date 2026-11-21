process.env.NODE_ENV = 'test';
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const app = require('../server');
const http = require('http');

let server;

async function runValidationTests() {
  const PORT = 5055;
  server = http.createServer(app);
  await new Promise(resolve => server.listen(PORT, resolve));
  const baseUrl = `http://localhost:${PORT}`;
  console.log(`Validation test server running on ${baseUrl}`);

  const post = async (url, body, token) => {
    const res = await fetch(`${baseUrl}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body)
    });
    return { status: res.status, data: await res.json().catch(() => null) };
  };

  const get = async (url, token) => {
    const res = await fetch(`${baseUrl}${url}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return { status: res.status, data: await res.json() };
    }
    return { status: res.status, text: await res.text() };
  };

  let passed = 0;
  let failed = 0;

  const assert = (condition, name) => {
    if (condition) {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name}`);
      failed++;
    }
  };

  try {
    console.log('\n--- 1. Testing Frontend Static Serving & Health ---');
    const health = await get('/api/health');
    assert(health.status === 200 && health.data?.status === 'UP', 'Health endpoint returns 200 UP');

    const html = await get('/');
    assert(html.status === 200 && html.text.includes('<div id="root"></div>'), 'Root serves React frontend index.html');

    console.log('\n--- 2. Testing Form Validations on Signup (Prompt Specifications) ---');
    // Name < 20 chars
    const shortNameRes = await post('/api/auth/signup', {
      name: 'Too Short',
      email: 'valid1@ratingapp.com',
      password: 'ValidPassword@1',
      address: 'Valid address for testing'
    });
    assert(shortNameRes.status === 400 && shortNameRes.data.errors?.name, 'Name < 20 characters rejected');

    // Name > 60 chars
    const longName = 'A'.repeat(61);
    const longNameRes = await post('/api/auth/signup', {
      name: longName,
      email: 'valid2@ratingapp.com',
      password: 'ValidPassword@1',
      address: 'Valid address for testing'
    });
    assert(longNameRes.status === 400 && longNameRes.data.errors?.name, 'Name > 60 characters rejected');

    // Invalid email
    const invalidEmailRes = await post('/api/auth/signup', {
      name: 'Valid Name Exactly Twenty Two',
      email: 'not-an-email',
      password: 'ValidPassword@1',
      address: 'Valid address for testing'
    });
    assert(invalidEmailRes.status === 400 && invalidEmailRes.data.errors?.email, 'Invalid email rejected');

    // Password < 8 chars
    const shortPassRes = await post('/api/auth/signup', {
      name: 'Valid Name Exactly Twenty Two',
      email: 'valid3@ratingapp.com',
      password: 'Pass@1',
      address: 'Valid address for testing'
    });
    assert(shortPassRes.status === 400 && shortPassRes.data.errors?.password, 'Password < 8 characters rejected');

    // Password > 16 chars
    const longPassRes = await post('/api/auth/signup', {
      name: 'Valid Name Exactly Twenty Two',
      email: 'valid4@ratingapp.com',
      password: 'VeryLongPassword@2026Exceeding16',
      address: 'Valid address for testing'
    });
    assert(longPassRes.status === 400 && longPassRes.data.errors?.password, 'Password > 16 characters rejected');

    // Password without uppercase
    const noUpperPassRes = await post('/api/auth/signup', {
      name: 'Valid Name Exactly Twenty Two',
      email: 'valid5@ratingapp.com',
      password: 'password@123',
      address: 'Valid address for testing'
    });
    assert(noUpperPassRes.status === 400 && noUpperPassRes.data.errors?.password, 'Password without uppercase rejected');

    // Password without special character
    const noSpecialPassRes = await post('/api/auth/signup', {
      name: 'Valid Name Exactly Twenty Two',
      email: 'valid6@ratingapp.com',
      password: 'Password123',
      address: 'Valid address for testing'
    });
    assert(noSpecialPassRes.status === 400 && noSpecialPassRes.data.errors?.password, 'Password without special char rejected');

    // Address > 400 chars
    const longAddress = 'B'.repeat(401);
    const longAddressRes = await post('/api/auth/signup', {
      name: 'Valid Name Exactly Twenty Two',
      email: 'valid7@ratingapp.com',
      password: 'ValidPassword@1',
      address: longAddress
    });
    assert(longAddressRes.status === 400 && longAddressRes.data.errors?.address, 'Address > 400 characters rejected');

    // Valid Signup
    const uniqueEmail = `testuser_${Date.now()}@ratingapp.com`;
    const validSignupRes = await post('/api/auth/signup', {
      name: 'Valid Test User Account Name',
      email: uniqueEmail,
      password: 'ValidPassword@1',
      address: '123 Test Street, Apartment 405, Silicon Valley, CA'
    });
    assert(validSignupRes.status === 201 && validSignupRes.data.token, 'Valid signup succeeds with 201 and JWT token');
    const newUserId = validSignupRes.data.user.id;
    const newUserToken = validSignupRes.data.token;

    console.log('\n--- 3. Testing Normal User Rating Capabilities ---');
    // Get stores for user
    const storesRes = await get('/api/stores', newUserToken);
    assert(storesRes.status === 200 && storesRes.data.stores.length > 0, 'Normal user can view registered stores');
    const storeToRate = storesRes.data.stores[0];

    // Submit rating 1-5
    const rateRes = await post(`/api/stores/${storeToRate.id}/rating`, { rating: 5 }, newUserToken);
    assert(rateRes.status === 200 && rateRes.data.rating.userRating === 5, 'User can submit a 5-star rating');

    // Modify rating to 4
    const modifyRateRes = await post(`/api/stores/${storeToRate.id}/rating`, { rating: 4 }, newUserToken);
    assert(modifyRateRes.status === 200 && modifyRateRes.data.rating.userRating === 4 && modifyRateRes.data.rating.isModification === true, 'User can modify their rating to 4-star');

    // Invalid rating (e.g. 6 or 0)
    const invalidRateRes = await post(`/api/stores/${storeToRate.id}/rating`, { rating: 6 }, newUserToken);
    assert(invalidRateRes.status === 400, 'Invalid rating (6) rejected');

    console.log('\n--- 4. Testing Admin Capabilities ---');
    // Admin login
    const adminLogin = await post('/api/auth/login', { email: 'admin@ratingapp.com', password: 'Admin@2026#' });
    const adminToken = adminLogin.data.token;

    // Admin dashboard stats
    const statsRes = await get('/api/admin/stats', adminToken);
    assert(statsRes.status === 200 && statsRes.data.stats.totalUsers >= 5, 'Admin stats returns total users, stores, ratings');

    // Admin create store
    const uniqueStoreEmail = `store_${Date.now()}@storehub.com`;
    const createStoreRes = await post('/api/admin/stores', {
      name: 'Grand Horizon Supermarket Plus',
      email: uniqueStoreEmail,
      address: '99 Grand Avenue, Commercial Center, Metro',
      ownerId: null
    }, adminToken);
    assert(createStoreRes.status === 201 && createStoreRes.data.store.id, 'Admin can create new store');

    // Admin create user
    const uniqueAdminUserEmail = `newadmin_${Date.now()}@ratingapp.com`;
    const createAdminUserRes = await post('/api/admin/users', {
      name: 'Senior Administrator Account',
      email: uniqueAdminUserEmail,
      password: 'AdminPass@2026',
      address: '77 Executive Tower, Financial District',
      role: 'ADMIN'
    }, adminToken);
    assert(createAdminUserRes.status === 201 && createAdminUserRes.data.user.role === 'ADMIN', 'Admin can create new admin user');

    // Admin users listing with filters and sorting
    const adminUsersSort = await get('/api/admin/users?sortBy=role&sortOrder=DESC', adminToken);
    assert(adminUsersSort.status === 200 && adminUsersSort.data.users.length > 0, 'Admin can list and sort users');
    const storeOwnerInList = adminUsersSort.data.users.find(u => u.role === 'STORE_OWNER');
    assert(storeOwnerInList && storeOwnerInList.rating !== undefined, 'Admin user list displays Store Owner rating');

    console.log('\n--- 5. Testing Store Owner Dashboard ---');
    const ownerLogin = await post('/api/auth/login', { email: 'owner1@ratingapp.com', password: 'Owner@2026#' });
    const ownerToken = ownerLogin.data.token;
    const ownerDashboard = await get('/api/owner/dashboard?sortBy=date&sortOrder=DESC', ownerToken);
    assert(ownerDashboard.status === 200 && ownerDashboard.data.hasStore === true, 'Store owner dashboard returns store info');
    assert(typeof ownerDashboard.data.stats.averageRating === 'number', 'Store owner dashboard displays average rating');
    assert(Array.isArray(ownerDashboard.data.ratedUsers), 'Store owner dashboard lists customers who rated their store');

    console.log(`\n========================================`);
    console.log(`TOTAL VALIDATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error('Unexpected error in validation tests:', err);
  } finally {
    server.close();
  }
}

runValidationTests();
