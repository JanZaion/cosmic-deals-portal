'use client';

import React, { useEffect, useState } from 'react';
import {
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiUser,
  FiTrendingUp,
  FiBarChart,
  FiActivity,
  FiRefreshCw,
} from 'react-icons/fi';
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
        return <FiActivity className="h-5 w-5" />;
      case 2: // On Hold
        return <FiClock className="h-5 w-5" />;
      case 3: // Waiting for Details
        return <FiAlertTriangle className="h-5 w-5" />;
      case 4: // Researching
        return <FiBarChart className="h-5 w-5" />;
      case 5: // Problem Solved
      case 1000: // Information Provided
        return <FiCheckCircle className="h-5 w-5" />;
      case 2000: // Canceled
        return <FiXCircle className="h-5 w-5" />;
      default:
        return <FiPackage className="h-5 w-5" />;
    }
  };

  const getPriorityIcon = (priorityCode: number) => {
    switch (priorityCode) {
      case 1: // High
        return <FiTrendingUp className="h-4 w-4" />;
      case 2: // Normal
        return <FiActivity className="h-4 w-4" />;
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMetrics = () => {
    const total = cases.length;
    const active = cases.filter((c) => c.statecode === 0).length;
    const resolved = cases.filter((c) => c.statecode === 1).length;
    const highPriority = cases.filter((c) => c.prioritycode === 1).length;

    return { total, active, resolved, highPriority };
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-2xl shadow-xl border border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiUser className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Authentication Required</h3>
          <p className="text-slate-600">Please authenticate to access your case management dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-2xl shadow-xl border border-slate-200">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiRefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Loading Dashboard</h3>
          <p className="text-slate-600">Retrieving your case data from Microsoft Dynamics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-2xl shadow-xl border border-red-200">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiXCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Connection Error</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={fetchCases}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const metrics = getMetrics();

  return (
    <div className="min-h-screen py-8">
      {/* Executive Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Case Management Dashboard</h1>
              <p className="text-slate-600 text-lg">Enterprise Service Desk Portal</p>
            </div>
            <button
              onClick={fetchCases}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <FiRefreshCw className="h-4 w-4" />
              <span>Refresh Data</span>
            </button>
          </div>

          {/* Executive Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 font-medium text-sm uppercase tracking-wide">Total Cases</p>
                  <p className="text-3xl font-bold text-blue-900">{metrics.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                  <FiPackage className="h-6 w-6 text-blue-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 font-medium text-sm uppercase tracking-wide">Active Cases</p>
                  <p className="text-3xl font-bold text-green-900">{metrics.active}</p>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                  <FiActivity className="h-6 w-6 text-green-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 font-medium text-sm uppercase tracking-wide">Resolved</p>
                  <p className="text-3xl font-bold text-purple-900">{metrics.resolved}</p>
                </div>
                <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                  <FiCheckCircle className="h-6 w-6 text-purple-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 font-medium text-sm uppercase tracking-wide">High Priority</p>
                  <p className="text-3xl font-bold text-red-900">{metrics.highPriority}</p>
                </div>
                <div className="w-12 h-12 bg-red-200 rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="h-6 w-6 text-red-700" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cases Grid */}
      {cases.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-12 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiPackage className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Cases Found</h3>
          <p className="text-slate-600">
            Your case portfolio is currently empty. New cases will appear here once created.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((caseItem) => (
            <div
              key={caseItem.incidentid}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-4">
                        {getStatusIcon(caseItem.statuscode)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {caseItem.title || `Case #${caseItem.incidentid.slice(-8)}`}
                        </h3>
                        <p className="text-slate-500 text-sm font-medium">ID: {caseItem.incidentid.slice(-12)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${dynamicsApi.getStatusColor(
                        caseItem.statuscode
                      )} border`}
                    >
                      {dynamicsApi.getStatusLabel(caseItem.statuscode)}
                    </span>

                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${dynamicsApi.getPriorityColor(
                        caseItem.prioritycode
                      )} border`}
                    >
                      {getPriorityIcon(caseItem.prioritycode)}
                      <span className="ml-1">{dynamicsApi.getPriorityLabel(caseItem.prioritycode)}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-50 rounded-xl p-6">
                  <div className="text-center">
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Case State</p>
                    <p className="text-slate-900 font-bold text-lg">{dynamicsApi.getStateLabel(caseItem.statecode)}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Created Date</p>
                    <p className="text-slate-900 font-semibold">{formatDate(caseItem.createdon)}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Last Modified</p>
                    <p className="text-slate-900 font-semibold">{formatDate(caseItem.modifiedon)}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Customer</p>
                    <p className="text-slate-900 font-semibold">
                      {caseItem.customerid_contact?.fullname || caseItem.customerid_account?.name || 'Not Assigned'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
