import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import Navbar from '../../components/Navbar';
import StarRating from '../../components/StarRating';
import SortableHeader from '../../components/SortableHeader';
import AddStoreModal from './AddStoreModal';
import AddUserModal from './AddUserModal';
import { 
  Plus, 
  RotateCcw, 
  AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stores'); // 'stores' | 'users'

  // Stats
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Stores State
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [storeFilterName, setStoreFilterName] = useState('');
  const [storeFilterEmail, setStoreFilterEmail] = useState('');
  const [storeFilterAddress, setStoreFilterAddress] = useState('');
  const [storeSortBy, setStoreSortBy] = useState('name');
  const [storeSortOrder, setStoreSortOrder] = useState('ASC');

  // Users State
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userFilterName, setUserFilterName] = useState('');
  const [userFilterEmail, setUserFilterEmail] = useState('');
  const [userFilterAddress, setUserFilterAddress] = useState('');
  const [userFilterRole, setUserFilterRole] = useState('');
  const [userSortBy, setUserSortBy] = useState('name');
  const [userSortOrder, setUserSortOrder] = useState('ASC');

  // Modals
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Fetch Dashboard Stats
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await api.getAdminStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch Stores
  const loadStores = useCallback(async () => {
    try {
      setStoresLoading(true);
      const params = new URLSearchParams();
      if (storeFilterName) params.append('name', storeFilterName);
      if (storeFilterEmail) params.append('email', storeFilterEmail);
      if (storeFilterAddress) params.append('address', storeFilterAddress);
      params.append('sortBy', storeSortBy);
      params.append('sortOrder', storeSortOrder);

      const res = await api.getAdminStores(params.toString());
      if (res.success) {
        setStores(res.stores || []);
      }
    } catch (err) {
      console.error('Failed to load stores:', err);
      setGeneralError('Could not load stores listing.');
    } finally {
      setStoresLoading(false);
    }
  }, [storeFilterName, storeFilterEmail, storeFilterAddress, storeSortBy, storeSortOrder]);

  // Fetch Users
  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const params = new URLSearchParams();
      if (userFilterName) params.append('name', userFilterName);
      if (userFilterEmail) params.append('email', userFilterEmail);
      if (userFilterAddress) params.append('address', userFilterAddress);
      if (userFilterRole) params.append('role', userFilterRole);
      params.append('sortBy', userSortBy);
      params.append('sortOrder', userSortOrder);

      const res = await api.getAdminUsers(params.toString());
      if (res.success) {
        setUsers(res.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      setGeneralError('Could not load users listing.');
    } finally {
      setUsersLoading(false);
    }
  }, [userFilterName, userFilterEmail, userFilterAddress, userFilterRole, userSortBy, userSortOrder]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (activeTab === 'stores') {
      loadStores();
    } else {
      loadUsers();
    }
  }, [activeTab, loadStores, loadUsers]);

  // Handle Sort for Stores
  const handleStoreSort = (field) => {
    if (storeSortBy.toLowerCase() === field.toLowerCase()) {
      setStoreSortOrder(storeSortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setStoreSortBy(field);
      setStoreSortOrder('ASC');
    }
  };

  // Handle Sort for Users
  const handleUserSort = (field) => {
    if (userSortBy.toLowerCase() === field.toLowerCase()) {
      setUserSortOrder(userSortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setUserSortBy(field);
      setUserSortOrder('ASC');
    }
  };

  const resetStoreFilters = () => {
    setStoreFilterName('');
    setStoreFilterEmail('');
    setStoreFilterAddress('');
  };

  const resetUserFilters = () => {
    setUserFilterName('');
    setUserFilterEmail('');
    setUserFilterAddress('');
    setUserFilterRole('');
  };

  const renderRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-800 border border-gray-300">
            Admin
          </span>
        );
      case 'STORE_OWNER':
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            Store Owner
          </span>
        );
      default:
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-gray-50 text-gray-600 border border-gray-200">
            Normal User
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Page Header & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage registered stores, user accounts, and platform metrics.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsAddStoreOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 hover:bg-black rounded-md shadow-xs transition-colors"
            >
              <Plus size={14} />
              <span>Add Store</span>
            </button>
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-xs transition-colors"
            >
              <Plus size={14} />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {generalError && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-sm rounded-md flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Dashboard Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-md border border-gray-200 shadow-xs">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Users
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {statsLoading ? '—' : stats.totalUsers}
            </p>
          </div>

          <div className="bg-white p-4 rounded-md border border-gray-200 shadow-xs">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Stores
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {statsLoading ? '—' : stats.totalStores}
            </p>
          </div>

          <div className="bg-white p-4 rounded-md border border-gray-200 shadow-xs">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Submitted Ratings
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {statsLoading ? '—' : stats.totalRatings}
            </p>
          </div>
        </div>

        {/* Tabs Bar & Content */}
        <div className="bg-white rounded-md border border-gray-200 shadow-xs overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-4 pt-2 gap-4">
            <button
              onClick={() => setActiveTab('stores')}
              className={`pb-2.5 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'stores'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>Stores</span>
              <span className="px-1.5 py-0.2 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                {stores.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`pb-2.5 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>Users</span>
              <span className="px-1.5 py-0.2 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                {users.length}
              </span>
            </button>
          </div>

          {/* STORES TAB */}
          {activeTab === 'stores' && (
            <div className="p-4 space-y-3">
              {/* Filter Row */}
              <div className="p-3 bg-gray-50/70 rounded-md border border-gray-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                  <span>Filter Stores:</span>
                  {(storeFilterName || storeFilterEmail || storeFilterAddress) && (
                    <button
                      onClick={resetStoreFilters}
                      className="text-gray-700 hover:text-black inline-flex items-center gap-1 font-medium"
                    >
                      <RotateCcw size={11} /> Reset
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    value={storeFilterName}
                    onChange={(e) => setStoreFilterName(e.target.value)}
                    placeholder="Filter by name..."
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  />
                  <input
                    type="text"
                    value={storeFilterEmail}
                    onChange={(e) => setStoreFilterEmail(e.target.value)}
                    placeholder="Filter by email..."
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  />
                  <input
                    type="text"
                    value={storeFilterAddress}
                    onChange={(e) => setStoreFilterAddress(e.target.value)}
                    placeholder="Filter by location/address..."
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  />
                </div>
              </div>

              {/* Stores Table */}
              <div className="overflow-x-auto rounded border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <SortableHeader
                        label="Store Name"
                        field="name"
                        currentSortBy={storeSortBy}
                        currentSortOrder={storeSortOrder}
                        onSort={handleStoreSort}
                      />
                      <SortableHeader
                        label="Email"
                        field="email"
                        currentSortBy={storeSortBy}
                        currentSortOrder={storeSortOrder}
                        onSort={handleStoreSort}
                      />
                      <SortableHeader
                        label="Address"
                        field="address"
                        currentSortBy={storeSortBy}
                        currentSortOrder={storeSortOrder}
                        onSort={handleStoreSort}
                      />
                      <SortableHeader
                        label="Overall Rating"
                        field="rating"
                        currentSortBy={storeSortBy}
                        currentSortOrder={storeSortOrder}
                        onSort={handleStoreSort}
                      />
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {storesLoading ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-xs">
                          Loading stores...
                        </td>
                      </tr>
                    ) : stores.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-xs">
                          No stores match your filters.
                        </td>
                      </tr>
                    ) : (
                      stores.map((store) => (
                        <tr key={store.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                            <div>{store.name}</div>
                            {store.owner_name && (
                              <div className="text-xs text-gray-400 font-normal">
                                Owner: {store.owner_name}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {store.email}
                          </td>
                          <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={store.address}>
                            {store.address}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <StarRating rating={store.rating} size={14} />
                              <span className="font-semibold text-gray-900 text-xs">
                                {store.rating > 0 ? store.rating.toFixed(2) : 'No ratings'}
                              </span>
                              {store.total_ratings > 0 && (
                                <span className="text-gray-400 text-xs">
                                  ({store.total_ratings})
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="p-4 space-y-3">
              {/* Filter Row */}
              <div className="p-3 bg-gray-50/70 rounded-md border border-gray-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                  <span>Filter Users:</span>
                  {(userFilterName || userFilterEmail || userFilterAddress || userFilterRole) && (
                    <button
                      onClick={resetUserFilters}
                      className="text-gray-700 hover:text-black inline-flex items-center gap-1 font-medium"
                    >
                      <RotateCcw size={11} /> Reset
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <input
                    type="text"
                    value={userFilterName}
                    onChange={(e) => setUserFilterName(e.target.value)}
                    placeholder="Filter by name..."
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  />
                  <input
                    type="text"
                    value={userFilterEmail}
                    onChange={(e) => setUserFilterEmail(e.target.value)}
                    placeholder="Filter by email..."
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  />
                  <input
                    type="text"
                    value={userFilterAddress}
                    onChange={(e) => setUserFilterAddress(e.target.value)}
                    placeholder="Filter by location/address..."
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  />
                  <select
                    value={userFilterRole}
                    onChange={(e) => setUserFilterRole(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-700"
                  >
                    <option value="">All Roles</option>
                    <option value="USER">Normal User</option>
                    <option value="ADMIN">Admin</option>
                    <option value="STORE_OWNER">Store Owner</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto rounded border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <SortableHeader
                        label="Name"
                        field="name"
                        currentSortBy={userSortBy}
                        currentSortOrder={userSortOrder}
                        onSort={handleUserSort}
                      />
                      <SortableHeader
                        label="Email"
                        field="email"
                        currentSortBy={userSortBy}
                        currentSortOrder={userSortOrder}
                        onSort={handleUserSort}
                      />
                      <SortableHeader
                        label="Address"
                        field="address"
                        currentSortBy={userSortBy}
                        currentSortOrder={userSortOrder}
                        onSort={handleUserSort}
                      />
                      <SortableHeader
                        label="Role"
                        field="role"
                        currentSortBy={userSortBy}
                        currentSortOrder={userSortOrder}
                        onSort={handleUserSort}
                      />
                      <SortableHeader
                        label="Store Rating"
                        field="rating"
                        currentSortBy={userSortBy}
                        currentSortOrder={userSortOrder}
                        onSort={handleUserSort}
                      />
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usersLoading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-xs">
                          Loading users...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-xs">
                          No users match your filters.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                            {u.name}
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {u.email}
                          </td>
                          <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={u.address}>
                            {u.address}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {renderRoleBadge(u.role)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {u.role === 'STORE_OWNER' ? (
                              u.rating !== null ? (
                                <div className="flex items-center gap-1.5">
                                  <StarRating rating={u.rating} size={13} />
                                  <span className="font-medium text-gray-900 text-xs">
                                    {u.rating.toFixed(2)}
                                  </span>
                                  {u.total_store_ratings > 0 && (
                                    <span className="text-[11px] text-gray-400">
                                      ({u.total_store_ratings})
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">
                                  No ratings
                                </span>
                              )
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Store Modal */}
      <AddStoreModal
        isOpen={isAddStoreOpen}
        onClose={() => setIsAddStoreOpen(false)}
        onStoreCreated={() => {
          loadStores();
          loadStats();
        }}
      />

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onUserCreated={() => {
          loadUsers();
          loadStats();
        }}
      />
    </div>
  );
};

export default AdminDashboard;
