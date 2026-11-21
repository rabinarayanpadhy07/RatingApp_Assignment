import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { X, AlertCircle, Check } from 'lucide-react';

const AddStoreModal = ({ isOpen, onClose, onStoreCreated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [availableOwners, setAvailableOwners] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetchingOwners, setFetchingOwners] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchAvailableOwners();
    }
  }, [isOpen]);

  const fetchAvailableOwners = async () => {
    try {
      setFetchingOwners(true);
      const res = await api.getAvailableOwners();
      if (res.success) {
        setAvailableOwners(res.owners || []);
      }
    } catch (err) {
      console.error('Failed to fetch owners:', err);
    } finally {
      setFetchingOwners(false);
    }
  };

  if (!isOpen) return null;

  const trimmedName = name.trim();
  const isNameValid = trimmedName.length >= 20 && trimmedName.length <= 60;
  const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
  const trimmedAddress = address.trim();
  const isAddressValid = trimmedAddress.length > 0 && trimmedAddress.length <= 400;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!isNameValid) {
      setError('Store name must be between 20 and 60 characters.');
      return;
    }
    if (!isEmailValid) {
      setError('Please provide a valid store email address.');
      return;
    }
    if (!isAddressValid) {
      setError('Address must not exceed 400 characters.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.createStore({
        name: trimmedName,
        email: email.trim().toLowerCase(),
        address: trimmedAddress,
        ownerId: ownerId ? parseInt(ownerId, 10) : null
      });

      setSuccess('Store created successfully.');
      setTimeout(() => {
        handleClose();
        if (onStoreCreated) onStoreCreated(res.store);
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to create store.');
      if (err.errors) {
        setFieldErrors(err.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setAddress('');
    setOwnerId('');
    setError('');
    setSuccess('');
    setFieldErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-gray-900 text-base">
            Add Store
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-md flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-md flex items-start gap-2">
              <Check size={15} className="shrink-0 mt-0.5 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* Store Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Store name
              </label>
              <span className="text-xs text-gray-400">
                {name.length}/60 (min 20)
              </span>
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sri Krishna Sweets & Bakery"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
            />
            {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
          </div>

          {/* Store Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@srikrishnasweets.in"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
            />
            {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
          </div>

          {/* Store Address */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Store address
              </label>
              <span className="text-xs text-gray-400">
                {address.length}/400 max
              </span>
            </div>
            <textarea
              rows={2}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Shop 12, Commercial Street, Shivaji Nagar, Bengaluru, Karnataka - 560001"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
            />
            {fieldErrors.address && <p className="text-xs text-red-600 mt-1">{fieldErrors.address}</p>}
          </div>

          {/* Optional Assign Store Owner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign store owner <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
            >
              <option value="">No owner assigned</option>
              {availableOwners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {fetchingOwners
                ? 'Loading owners...'
                : availableOwners.length === 0
                ? 'No unassigned store owners available. You can assign one later.'
                : 'Select an existing store owner without an assigned store.'}
            </p>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="px-3.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isNameValid || !isEmailValid || !isAddressValid}
              className="px-4 py-1.5 text-xs font-medium text-white bg-gray-900 hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-xs transition-colors"
            >
              {loading ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStoreModal;
