'use client';

import React, { useEffect, useState } from 'react';
import { FiPackage, FiClock, FiCheckCircle, FiXCircle, FiAlertTriangle, FiUser } from 'react-icons/fi';
import { dynamicsApi, Case } from '../lib/dynamics-api';
import { useAuth } from './AuthProvider';

export default function CasesDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCases();
    }
  }, [isAuthenticated, user]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, you would get the customer ID from the user's profile
      // For now, we'll fetch all cases (you may want to filter by customer)
      const fetchedCases = await dynamicsApi.getCases();
      setCases(fetchedCases);
    } catch (err) {
      setError('Failed to load cases. Please try again.');
      console.error('Error fetching cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (statusCode: number) => {
    switch (statusCode) {
      case 1: // In Progress
        return <FiClock className="h-4 w-4" />;
      case 2: // On Hold
        return <FiAlertTriangle className="h-4 w-4" />;
      case 3: // Waiting for Details
        return <FiClock className="h-4 w-4" />;
      case 4: // Researching
        return <FiClock className="h-4 w-4" />;
      case 5: // Problem Solved
      case 1000: // Information Provided
        return <FiCheckCircle className="h-4 w-4" />;
      case 2000: // Canceled
        return <FiXCircle className="h-4 w-4" />;
      default:
        return <FiPackage className="h-4 w-4" />;
    }
  };

  const getPriorityIcon = (priorityCode: number) => {
    switch (priorityCode) {
      case 1: // High
        return <FiAlertTriangle className="h-4 w-4" />;
      case 2: // Normal
        return <FiUser className="h-4 w-4" />;
      case 3: // Low
        return <FiUser className="h-4 w-4" />;
      default:
        return <FiUser className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Please log in to view your cases.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading cases...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button onClick={fetchCases} className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Cases</h2>
        <button
          onClick={fetchCases}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Refresh
        </button>
      </div>

      {cases.length === 0 ? (
        <div className="text-center py-12">
          <FiPackage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No cases found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {cases.map((caseItem) => (
            <div
              key={caseItem.incidentid}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {caseItem.title || `Case #${caseItem.incidentid.slice(-8)}`}
                    </h3>
                    <span
                      className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dynamicsApi.getStatusColor(
                        caseItem.statuscode
                      )}`}
                    >
                      {getStatusIcon(caseItem.statuscode)}
                      <span className="ml-1">{dynamicsApi.getStatusLabel(caseItem.statuscode)}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <span className="text-gray-500">State:</span>
                      <span className="ml-1 font-medium">{dynamicsApi.getStateLabel(caseItem.statecode)}</span>
                    </div>

                    <div className="flex items-center">
                      {getPriorityIcon(caseItem.prioritycode)}
                      <span className="ml-1">
                        <span className="text-gray-500">Priority:</span>{' '}
                        <span className={`font-medium ${dynamicsApi.getPriorityColor(caseItem.prioritycode)}`}>
                          {dynamicsApi.getPriorityLabel(caseItem.prioritycode)}
                        </span>
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500">Created:</span> {formatDate(caseItem.createdon)}
                    </div>

                    <div>
                      <span className="text-gray-500">Modified:</span> {formatDate(caseItem.modifiedon)}
                    </div>
                  </div>

                  {(caseItem.customerid_contact || caseItem.customerid_account) && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-gray-500">Customer:</span>{' '}
                      {caseItem.customerid_contact?.fullname || caseItem.customerid_account?.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
