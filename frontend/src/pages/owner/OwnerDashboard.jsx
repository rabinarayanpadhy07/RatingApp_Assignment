import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import Navbar from '../../components/Navbar';
import StarRating from '../../components/StarRating';
import SortableHeader from '../../components/SortableHeader';
import { 
  Store, 
  MapPin, 
  Mail, 
  AlertCircle
} from 'lucide-react';

const OwnerDashboard = () => {
  const [data, setData] = useState({
    hasStore: true,
    store: null,
    stats: { averageRating: 0, totalRatings: 0 },
    ratedUsers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('DESC');

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sortBy,
        sortOrder
      });

      const res = await api.getOwnerDashboard(params.toString());
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Owner dashboard load failed:', err);
      setError('Failed to load store owner dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortOrder]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleSort = (field) => {
    if (sortBy.toLowerCase() === field.toLowerCase()) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Page Header */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Store Performance
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            View store profile, rating averages, and submitted customer reviews.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-sm rounded-md flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-md border border-gray-200 p-12 text-center text-gray-500 text-sm">
            Loading store performance...
          </div>
        ) : !data.hasStore || !data.store ? (
          <div className="bg-white rounded-md border border-gray-200 p-8 sm:p-10 text-center max-w-md mx-auto shadow-xs">
            <Store size={36} className="text-gray-400 mx-auto mb-3" />
            <h2 className="text-base font-semibold text-gray-900">No Store Assigned</h2>
            <p className="text-sm text-gray-500 mt-1">
              Your store owner account is active, but an administrator has not yet assigned a store to your account.
            </p>
          </div>
        ) : (
          <>
            {/* Store Info & Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Store Details Card */}
              <div className="md:col-span-2 bg-white rounded-md border border-gray-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">
                    Store Details
                  </span>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {data.store.name}
                  </h2>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                    <Mail size={13} className="text-gray-400 shrink-0" />
                    <span className="truncate">{data.store.email}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-start gap-1.5 text-xs text-gray-600">
                  <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{data.store.address}</span>
                </div>
              </div>

              {/* Rating Metric Card */}
              <div className="bg-white rounded-md border border-gray-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">
                    Average Rating
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-semibold text-gray-900">
                      {data.stats.averageRating > 0 ? data.stats.averageRating.toFixed(2) : '0.00'}
                    </span>
                    <span className="text-xs font-medium text-gray-400">/ 5.0</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <StarRating rating={data.stats.averageRating} size={16} />
                  <span className="text-xs text-gray-500">
                    {data.stats.totalRatings} {data.stats.totalRatings === 1 ? 'rating' : 'ratings'}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Ratings Table */}
            <div className="bg-white rounded-md border border-gray-200 shadow-xs overflow-hidden">
              <div className="px-4 sm:px-5 py-3.5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900 text-sm">
                    Customer Ratings
                  </h3>
                  <span className="px-2 py-0.5 bg-gray-200/70 text-gray-700 text-xs font-medium rounded">
                    {data.ratedUsers.length}
                  </span>
                </div>
                <span className="text-xs text-gray-400 hidden sm:inline">
                  Reviews submitted by registered users
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <SortableHeader
                        label="Customer"
                        field="name"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="Email"
                        field="email"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                      />
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <SortableHeader
                        label="Rating"
                        field="rating"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="Date"
                        field="date"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                      />
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.ratedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-gray-500 text-sm">
                          No customer ratings have been submitted for your store yet.
                        </td>
                      </tr>
                    ) : (
                      data.ratedUsers.map((user) => (
                        <tr key={user.user_id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                            {user.user_name}
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {user.user_email}
                          </td>
                          <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={user.user_address}>
                            {user.user_address}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <StarRating rating={user.rating} size={14} />
                              <span className="font-semibold text-gray-900 text-xs">
                                {user.rating}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                            {formatDate(user.updated_at || user.created_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default OwnerDashboard;
