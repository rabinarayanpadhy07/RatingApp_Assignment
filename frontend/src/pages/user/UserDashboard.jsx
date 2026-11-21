import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import Navbar from '../../components/Navbar';
import StarRating from '../../components/StarRating';
import SortableHeader from '../../components/SortableHeader';
import { 
  Store, 
  Search, 
  MapPin, 
  Star, 
  CheckCircle, 
  AlertCircle,
  LayoutGrid,
  List
} from 'lucide-react';

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Rating submission state
  const [submittingStoreId, setSubmittingStoreId] = useState(null);
  const [selectedRatings, setSelectedRatings] = useState({}); // { [storeId]: rating }
  const [message, setMessage] = useState({ text: '', type: '' });

  const loadStores = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const res = await api.getUserStores(params.toString());
      if (res.success) {
        setStores(res.stores || []);
        // Initialize selectedRatings with existing user ratings
        const initialRatings = {};
        res.stores.forEach(s => {
          if (s.user_rating) {
            initialRatings[s.id] = s.user_rating;
          }
        });
        setSelectedRatings(prev => ({ ...initialRatings, ...prev }));
      }
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const handleSort = (field) => {
    if (sortBy.toLowerCase() === field.toLowerCase()) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  const handleRatingChange = (storeId, newRating) => {
    setSelectedRatings(prev => ({
      ...prev,
      [storeId]: newRating
    }));
  };

  const handleRatingSubmit = async (storeId) => {
    const ratingValue = selectedRatings[storeId];
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      setMessage({ text: 'Please select a rating between 1 and 5 stars.', type: 'error' });
      return;
    }

    try {
      setSubmittingStoreId(storeId);
      const res = await api.submitRating(storeId, ratingValue);
      setMessage({ text: res.message || 'Rating submitted successfully.', type: 'success' });

      // Update store in state immediately
      setStores(prevStores =>
        prevStores.map(store => {
          if (store.id === storeId) {
            return {
              ...store,
              user_rating: ratingValue,
              overall_rating: res.rating.overallRating,
              total_ratings: res.rating.totalRatings
            };
          }
          return store;
        })
      );

      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    } catch (err) {
      setMessage({ text: err.message || 'Failed to submit rating.', type: 'error' });
    } finally {
      setSubmittingStoreId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Stores Directory
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Browse stores, view overall community ratings, and submit or modify your ratings.
            </p>
          </div>
          <div className="text-xs text-gray-500 font-medium self-start sm:self-auto">
            {stores.length} {stores.length === 1 ? 'store available' : 'stores available'}
          </div>
        </div>

        {/* Global Feedback Banner */}
        {message.text && (
          <div
            className={`p-3.5 rounded-md flex items-center gap-2.5 text-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-red-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Controls Bar: Search & View Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border border-gray-200 rounded-md shadow-xs">
          <div className="relative flex-1 sm:max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search stores by name or location (e.g. Bengaluru, Mumbai)..."
              className="w-full pl-9 pr-8 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-md self-end sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Store Content */}
        {loading ? (
          <div className="bg-white rounded-md border border-gray-200 p-12 text-center text-gray-500 text-sm">
            Loading stores...
          </div>
        ) : stores.length === 0 ? (
          <div className="bg-white rounded-md border border-gray-200 p-12 text-center text-gray-500">
            <Store size={36} className="mx-auto text-gray-300 mb-2" />
            <p className="font-medium text-gray-800 text-sm">No stores found</p>
            <p className="text-xs text-gray-500 mt-1">
              {searchTerm ? `No stores match "${searchTerm}".` : 'No stores have been registered yet.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stores.map((store) => {
              const currentSelected = selectedRatings[store.id] || store.user_rating || 0;
              const hasUserRated = store.user_rating !== null && store.user_rating !== undefined;
              const hasChanged = selectedRatings[store.id] && selectedRatings[store.id] !== store.user_rating;
              const isSubmitting = submittingStoreId === store.id;

              return (
                <div
                  key={store.id}
                  className="bg-white rounded-md border border-gray-200 p-5 shadow-xs flex flex-col justify-between hover:border-gray-300 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">
                          {store.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">{store.email}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-600 text-xs rounded font-medium shrink-0">
                        Store
                      </span>
                    </div>

                    <div className="flex items-start gap-1.5 text-xs text-gray-600 bg-gray-50 p-2.5 rounded border border-gray-100">
                      <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{store.address}</span>
                    </div>

                    {/* Overall Community Rating */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                      <span className="text-xs font-medium text-gray-500">
                        Community Rating:
                      </span>
                      <div className="flex items-center gap-2">
                        <StarRating rating={store.overall_rating} size={15} />
                        <span className="text-sm font-semibold text-gray-900">
                          {store.overall_rating > 0 ? store.overall_rating.toFixed(2) : 'No ratings'}
                        </span>
                        {store.total_ratings > 0 && (
                          <span className="text-xs text-gray-400">
                            ({store.total_ratings} {store.total_ratings === 1 ? 'review' : 'reviews'})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating Submission Area */}
                  <div className="mt-4 pt-3.5 border-t border-gray-100 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-medium text-gray-500 mb-1">
                        {hasUserRated ? (
                          <span>Your rating: <strong className="text-gray-900">{store.user_rating} / 5</strong></span>
                        ) : (
                          <span>Rate this store:</span>
                        )}
                      </div>
                      <StarRating
                        rating={currentSelected}
                        interactive={true}
                        size={19}
                        onChange={(r) => handleRatingChange(store.id, r)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <button
                      onClick={() => handleRatingSubmit(store.id)}
                      disabled={isSubmitting || currentSelected === 0 || (hasUserRated && !hasChanged)}
                      className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap self-end sm:self-auto ${
                        hasUserRated
                          ? hasChanged
                            ? 'bg-gray-900 hover:bg-black text-white shadow-xs'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                          : currentSelected > 0
                          ? 'bg-gray-900 hover:bg-black text-white shadow-xs'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                      }`}
                    >
                      {isSubmitting
                        ? 'Saving...'
                        : hasUserRated
                        ? hasChanged
                          ? 'Update Rating'
                          : 'Saved'
                        : 'Submit Rating'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="bg-white rounded-md border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <SortableHeader
                      label="Store Name"
                      field="name"
                      currentSortBy={sortBy}
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Address"
                      field="address"
                      currentSortBy={sortBy}
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Community Rating"
                      field="overall_rating"
                      currentSortBy={sortBy}
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Your Rating"
                      field="user_rating"
                      currentSortBy={sortBy}
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate / Modify
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stores.map((store) => {
                    const currentSelected = selectedRatings[store.id] || store.user_rating || 0;
                    const hasUserRated = store.user_rating !== null && store.user_rating !== undefined;
                    const hasChanged = selectedRatings[store.id] && selectedRatings[store.id] !== store.user_rating;
                    const isSubmitting = submittingStoreId === store.id;

                    return (
                      <tr key={store.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                          <div>{store.name}</div>
                          <div className="text-xs text-gray-400 font-normal">{store.email}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={store.address}>
                          {store.address}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <StarRating rating={store.overall_rating} size={14} />
                            <span className="font-medium text-gray-900 text-xs">
                              {store.overall_rating > 0 ? store.overall_rating.toFixed(2) : 'No ratings'}
                            </span>
                            {store.total_ratings > 0 && (
                              <span className="text-xs text-gray-400">
                                ({store.total_ratings})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {hasUserRated ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-900">
                              <Star size={13} className="fill-amber-400 text-amber-400" />
                              {store.user_rating} / 5
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Not rated
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2.5">
                            <StarRating
                              rating={currentSelected}
                              interactive={true}
                              size={17}
                              onChange={(r) => handleRatingChange(store.id, r)}
                              disabled={isSubmitting}
                            />
                            <button
                              onClick={() => handleRatingSubmit(store.id)}
                              disabled={isSubmitting || currentSelected === 0 || (hasUserRated && !hasChanged)}
                              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                hasUserRated
                                  ? hasChanged
                                    ? 'bg-gray-900 hover:bg-black text-white'
                                    : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                  : currentSelected > 0
                                  ? 'bg-gray-900 hover:bg-black text-white'
                                  : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                              }`}
                            >
                              {isSubmitting
                                ? 'Saving...'
                                : hasUserRated
                                ? hasChanged
                                  ? 'Update'
                                  : 'Saved'
                                : 'Rate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
