import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInventoryStore } from '../store/useInventoryStore';
import { useOrderStore } from '../store/useOrderStore';
import { useAuth } from '../context/AuthContext';
import {
  CubeIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { formatCurrency } from '../utils/helpers';
import LoadingSpinner from '../components/common/loadingSpinner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardPage = () => {
  const { isAdmin } = useAuth();
  const { products, fetchProducts, getInventoryStats } = useInventoryStore();
  const { orders, fetchAllOrders, getOrderStats } = useOrderStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalProducts: 0,
  });
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    totalValue: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchProducts(), fetchAllOrders()]);
    setStats(getInventoryStats());
    setOrderStats(getOrderStats());
    setLoading(false);
  };

  // Chart data
  const categoryData = {
    labels: ['Solar Panels', 'Inverters', 'Batteries', 'Mounting', 'Cables', 'Others'],
    datasets: [
      {
        label: 'Quantity in Stock',
        data: [150, 45, 8, 25, 2, 0],
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
        borderColor: 'rgb(14, 165, 233)',
        borderWidth: 1,
      },
    ],
  };

  const stockStatusData = {
    labels: ['In Stock', 'Low Stock', 'Out of Stock'],
    datasets: [
      {
        data: [3, 1, 1],
        backgroundColor: [
          'rgba(34, 197, 94, 0.5)',
          'rgba(234, 179, 8, 0.5)',
          'rgba(239, 68, 68, 0.5)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <button
          onClick={loadData}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CubeIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Items in Stock
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.totalItems}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Inventory Value
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {formatCurrency(stats.totalValue)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Low Stock Alerts
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.lowStockItems}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCartIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Orders
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {orderStats.pending}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Inventory by Category
          </h3>
          <div className="h-64">
            <Bar data={categoryData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Stock Status Distribution
          </h3>
          <div className="h-64">
            <Doughnut data={stockStatusData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {orders.slice(0, 5).map((order) => (
            <div key={order.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.items.length} items • {formatCurrency(order.totalAmount)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`badge-${order.status === 'pending' ? 'warning' : 
                    order.status === 'approved' ? 'info' :
                    order.status === 'delivered' ? 'success' : 'danger'}`}>
                    {order.status}
                  </span>
                  <Link
                    to={`/orders/${order.id}`}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <Link
            to="/orders"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all orders →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      {isAdmin() && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/inventory/add"
              className="text-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <CubeIcon className="h-8 w-8 mx-auto text-primary-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Add Product</span>
            </Link>
            <Link
              to="/users/add"
              className="text-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <UsersIcon className="h-8 w-8 mx-auto text-primary-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Add User</span>
            </Link>
            <Link
              to="/reports"
              className="text-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <ChartBarIcon className="h-8 w-8 mx-auto text-primary-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Generate Report</span>
            </Link>
            <Link
              to="/inventory/low-stock"
              className="text-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <ExclamationTriangleIcon className="h-8 w-8 mx-auto text-primary-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Low Stock</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;