import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';
import { LogOut, KeyRound, Store } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  if (!user) return null;

  const roleLabels = {
    ADMIN: 'Admin',
    STORE_OWNER: 'Store Owner',
    USER: 'User'
  };

  const roleStyles = {
    ADMIN: 'bg-gray-100 text-gray-800 border-gray-300',
    STORE_OWNER: 'bg-blue-50 text-blue-700 border-blue-200',
    USER: 'bg-gray-50 text-gray-600 border-gray-200'
  };

  const currentRoleLabel = roleLabels[user.role] || 'User';
  const currentRoleStyle = roleStyles[user.role] || roleStyles.USER;

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between">
          {/* Logo & App Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-gray-900 text-white flex items-center justify-center shrink-0">
              <Store size={18} strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 text-sm sm:text-base leading-none">
                Store Ratings
              </span>
              <span className="text-[10px] sm:text-[11px] text-gray-500 font-normal mt-0.5">
                Rating & Review Portal
              </span>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex flex-col items-end text-right">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 max-w-[200px] truncate" title={user.name}>
                  {user.name}
                </span>
                <span className={`inline-block px-2 py-0.5 text-[11px] font-medium border rounded ${currentRoleStyle}`}>
                  {currentRoleLabel}
                </span>
              </div>
              <span className="text-xs text-gray-500 max-w-[220px] truncate">
                {user.email}
              </span>
            </div>

            {/* Mobile Role Badge */}
            <span className={`sm:hidden inline-block px-1.5 py-0.5 text-[10px] font-medium border rounded ${currentRoleStyle}`}>
              {currentRoleLabel}
            </span>

            <div className="h-5 w-[1px] bg-gray-200 hidden sm:block"></div>

            {/* Change Password */}
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors"
              title="Change Password"
            >
              <KeyRound size={13} className="text-gray-500" />
              <span className="hidden md:inline">Change Password</span>
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-red-700 hover:bg-red-50 border border-gray-300 hover:border-red-200 rounded-md transition-colors"
              title="Sign Out"
            >
              <LogOut size={13} />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
