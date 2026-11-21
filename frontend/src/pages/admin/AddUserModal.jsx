import React, { useState } from 'react';
import { api } from '../../services/api';
import { X, AlertCircle, Check, Eye, EyeOff } from 'lucide-react';

const AddUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('USER');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedAddress = address.trim();

    if (!trimmedName || trimmedName.length < 20 || trimmedName.length > 60) {
      setError(`Full name must be between 20 and 60 characters (currently ${trimmedName.length}).`);
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!password || password.length < 8 || password.length > 16) {
      setError('Password must be between 8 and 16 characters.');
      return;
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\\/`~]/.test(password);
    if (!hasUppercase || !hasSpecial) {
      setError('Password must contain at least one uppercase letter (A-Z) and one special character (!@#$%...).');
      return;
    }

    if (!trimmedAddress || trimmedAddress.length > 400) {
      setError('Address cannot be empty and must not exceed 400 characters.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.createUser({
        name: trimmedName,
        email: trimmedEmail,
        password,
        address: trimmedAddress,
        role
      });

      setSuccess(res.message || 'User created successfully.');
      setTimeout(() => {
        handleClose();
        if (onUserCreated) onUserCreated(res.user);
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to create user.');
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
    setPassword('');
    setAddress('');
    setRole('USER');
    setError('');
    setSuccess('');
    setFieldErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 font-sans">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-gray-900 text-base">
            Add User
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

          {/* User Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'USER', label: 'User' },
                { id: 'ADMIN', label: 'Admin' },
                { id: 'STORE_OWNER', label: 'Store Owner' }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`py-1.5 px-3 text-xs font-medium rounded-md border transition-colors text-center ${
                    role === r.id
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Full name
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
              placeholder="e.g. Vikramaditya Singh Rathore"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
            />
            {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@ratingapp.in"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
            />
            {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
          </div>

          {/* Password (Single Section) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 pr-9 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              8–16 characters with at least 1 uppercase letter and 1 special character
            </p>
            {fieldErrors.password && <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>}
          </div>

          {/* Address */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Address
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
              placeholder="e.g. B-304, Green Glen Layout, Bellandur, Bengaluru, Karnataka - 560103"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
            />
            {fieldErrors.address && <p className="text-xs text-red-600 mt-1">{fieldErrors.address}</p>}
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
              disabled={loading}
              className="px-4 py-1.5 text-xs font-medium text-white bg-gray-900 hover:bg-black disabled:opacity-50 rounded-md shadow-xs transition-colors"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
