'use client';

import React from 'react';
import { FiUser, FiLogOut, FiLoader } from 'react-icons/fi';
import { useAuth } from './AuthProvider';

export default function LoginButton() {
  const { isAuthenticated, user, login, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center space-x-3 bg-slate-100 px-4 py-2 rounded-lg">
        <FiLoader className="h-4 w-4 text-slate-600 animate-spin" />
        <span className="text-sm font-medium text-slate-600">Authenticating...</span>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <FiUser className="h-4 w-4 text-white" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-slate-900">{user.name || user.username}</p>
            <p className="text-xs text-slate-500">Authenticated User</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <FiLogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
    >
      <span>Sign In with Microsoft</span>
    </button>
  );
}
