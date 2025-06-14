'use client';

import React, { useEffect, useState } from 'react';
import { FiPackage, FiClock, FiCheckCircle, FiXCircle, FiDollarSign } from 'react-icons/fi';
import { dynamicsApi, Order } from '../lib/dynamics-api';
import { useAuth } from './AuthProvider';

export default function OrdersDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, you would get the customer ID from the user's profile
      // For now, we'll fetch all orders (you may want to filter by customer)
      const fetchedOrders = await dynamicsApi.getOrders();
      setOrders(fetchedOrders);
    } catch (err) {
      setError('Failed to load orders. Please try again.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (statusCode: number) => {
    switch (statusCode) {
      case 100000000: // New
        return <FiClock className="h-4 w-4" />;
      case 100000001: // Pending
        return <FiClock className="h-4 w-4" />;
      case 100000002: // Won
      case 100000004: // Fulfilled
        return <FiCheckCircle className="h-4 w-4" />;
      case 100000003: // Canceled
        return <FiXCircle className="h-4 w-4" />;
      default:
        return <FiPackage className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
        <p className="text-gray-600 dark:text-gray-400">Please log in to view your orders.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button onClick={fetchOrders} className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Orders</h2>
        <button
          onClick={fetchOrders}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <FiPackage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No orders found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order.salesorderid}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {order.name || `Order #${order.salesorderid.slice(-8)}`}
                    </h3>
                    <span
                      className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dynamicsApi.getStatusColor(
                        order.statuscode
                      )}`}
                    >
                      {getStatusIcon(order.statuscode)}
                      <span className="ml-1">{dynamicsApi.getStatusLabel(order.statuscode)}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <FiDollarSign className="h-4 w-4 mr-1" />
                      <span className="font-medium">{formatCurrency(order.totalamount)}</span>
                    </div>

                    <div>
                      <span className="text-gray-500">Created:</span> {formatDate(order.createdon)}
                    </div>

                    <div>
                      <span className="text-gray-500">Modified:</span> {formatDate(order.modifiedon)}
                    </div>
                  </div>

                  {order.customerid_contact && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-gray-500">Customer:</span> {order.customerid_contact.fullname}
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
