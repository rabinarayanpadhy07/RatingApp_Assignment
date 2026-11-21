import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, AlertCircle, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      const role = res.user.role;
      if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'STORE_OWNER') {
        navigate('/owner');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md">
        {/* Single unified Login Card containing Logo & All Elements */}
        <div className="bg-white py-8 px-6 sm:px-8 border border-gray-200 rounded-lg shadow-sm">
          {/* Logo & Header strictly inside the card */}
          <div className="text-center mb-6">
            <div className="inline-flex w-10 h-10 rounded-md bg-gray-900 text-white items-center justify-center mb-3">
              <Store size={20} strokeWidth={2} />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Sign in to Store Ratings
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Enter your credentials to access your portal
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-md flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.in"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
              </div>
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2 px-4 bg-gray-900 hover:bg-black disabled:opacity-50 text-white text-sm font-medium rounded-md shadow-xs transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">
              Quick test accounts:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@ratingapp.com', 'Admin@2026#')}
                className="px-2 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors text-center"
                title="Admin: Rajeshwar Sharma"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('user1@ratingapp.com', 'User@2026#')}
                className="px-2 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors text-center"
                title="User: Rahul Kulkarni"
              >
                Normal User
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('owner1@ratingapp.com', 'Owner@2026#')}
                className="px-2 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors text-center"
                title="Owner: Vikramaditya Rathore"
              >
                Store Owner
              </button>
            </div>
          </div>

          {/* Signup Link */}
          <div className="mt-5 text-center text-xs text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-gray-900 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
