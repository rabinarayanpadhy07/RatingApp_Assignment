import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, AlertCircle, Eye, EyeOff } from 'lucide-react';

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

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

    if (!trimmedAddress || trimmedAddress.length > 400) {
      setError('Address cannot be empty and must not exceed 400 characters.');
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

    try {
      setLoading(true);
      await signup({
        name: trimmedName,
        email: trimmedEmail,
        address: trimmedAddress,
        password
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
      if (err.errors) {
        setFieldErrors(err.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md">
        {/* Single unified Card containing Logo, Title, and Form */}
        <div className="bg-white py-8 px-6 sm:px-8 border border-gray-200 rounded-lg shadow-sm">
          {/* Logo & Header inside the card */}
          <div className="text-center mb-6">
            <div className="inline-flex w-10 h-10 rounded-md bg-gray-900 text-white items-center justify-center mb-3">
              <Store size={20} strokeWidth={2} />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Create an account
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Register as a user to browse and rate local stores
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-md flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Name */}
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
                placeholder="e.g. Rahul Devendra Kulkarni"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
              />
              {fieldErrors.name && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>
              )}
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
                placeholder="rahul.kulkarni@example.in"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
              )}
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
                placeholder="e.g. Flat 402, Lotus Residency, Baner Road, Pune, Maharashtra - 411045"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
              />
              {fieldErrors.address && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.address}</p>
              )}
            </div>

            {/* Single Password Section (Confirm Password removed) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                8–16 characters with at least 1 uppercase letter and 1 special character
              </p>
              {fieldErrors.password && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2 px-4 bg-gray-900 hover:bg-black disabled:opacity-50 text-white text-sm font-medium rounded-md shadow-xs transition-colors"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-gray-900 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
