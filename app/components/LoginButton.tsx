'use client';

import React from 'react';
import { useAuth } from './AuthProvider';

export default function LoginButton() {
  const { isAuthenticated, user, login, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-sm">
          <span className="text-gray-600 dark:text-gray-400">Welcome, </span>
          <span className="font-medium text-gray-900 dark:text-white">{user.name || user.username}</span>
        </div>
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
    >
      Sign In with Microsoft
    </button>
  );
}
