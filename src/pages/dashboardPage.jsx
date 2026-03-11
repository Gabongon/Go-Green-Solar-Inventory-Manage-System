import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrderStore } from '../store/useOrderStore';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/helpers';
import { supabase } from '../supabaseClient';
import LoadingSpinner from '../components/common/loadingSpinner';

import { 
  UserCircleIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ShoppingCartIcon,
  ArrowPathIcon,
  UsersIcon,
  EyeIcon,
  PencilIcon
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
  const { user, isAdmin } = useAuth();
  const { orders, fetchAllOrders, getOrderStats } = useOrderStore();
  
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null); 
  const [inventoryItems, setInventoryItems] = useState([]);

  // Dynamic state for our numbers
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
  });

  // Dynamic state for our charts
  const [chartData, setChartData] = useState({
    categoryLabels: [],
    categoryQuantities: [],
    stockStatusCounts: [0, 0, 0] // [In Stock, Low Stock, Out of Stock]
  });

  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    totalValue: 0,
  });

  const fetchUserProfile = async () => {
    try {
      if (!user?.id) return; 
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      if (data) setUserProfile(data);
    } catch (err) {
      console.error("Error fetching profile for dashboard:", err);
    }
  };

  // FETCH ALL DATA AND CALCULATE STATS
  const fetchInventoryData = async () => {
    try {
      // Fetch ALL items to calculate accurate stats (we will slice it later for the table)
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setInventoryItems(data);

        // --- CALCULATE DYNAMIC STATISTICS ---
        let lowStock = 0;
        let outOfStock = 0;
        let inStock = 0;
        const categoryCounts = {};

        data.forEach(item => {
          const qty = Number(item.qty) || 0;

          // 1. Calculate Stock Status
          if (qty <= 0) {
            outOfStock++;
          } else if (qty <= 10) {
            lowStock++;
          } else {
            inStock++;
          }

          // 2. Group by Category for the Bar Chart
          const categoryName = item.category || 'Uncategorized';
          categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + qty;
        });

        // Update Stats Cards
        setStats({
          totalItems: data.length, // Total unique items in the database
          lowStockItems: lowStock,
          outOfStockItems: outOfStock,
        });

        // Update Charts
        setChartData({
          categoryLabels: Object.keys(categoryCounts),
          categoryQuantities: Object.values(categoryCounts),
          stockStatusCounts: [inStock, lowStock, outOfStock]
        });
      }
    } catch (err) {
      console.error("Error fetching inventory items:", err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchAllOrders(),
        fetchUserProfile(),
        fetchInventoryData()
      ]);
      setOrderStats(getOrderStats());
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- DYNAMIC CHART CONFIGURATIONS ---
  const dynamicCategoryData = {
    labels: chartData.categoryLabels.length > 0 ? chartData.categoryLabels : ['No Data'],
    datasets: [
      {
        label: 'Quantity in Stock',
        data: chartData.categoryQuantities.length > 0 ? chartData.categoryQuantities : [0],
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
        borderColor: 'rgb(249, 115, 22)',
        borderWidth: 1,
      },
    ],
  };

  const dynamicStockStatusData = {
    labels: ['In Stock', 'Low Stock', 'Out of Stock'],
    datasets: [
      {
        data: chartData.stockStatusCounts,
        backgroundColor: [
          'rgba(34, 197, 94, 0.5)', // Green
          'rgba(234, 179, 8, 0.5)', // Yellow
          'rgba(239, 68, 68, 0.5)', // Red
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
      {/* Welcome Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 flex-shrink-0 flex items-center justify-center">
            {userProfile?.avatar_url ? (
              <img 
                src={userProfile.avatar_url} 
                alt="Profile" 
                className="h-16 w-16 rounded-full object-cover border-2 border-orange-500"
              />
            ) : (
              <UserCircleIcon className="h-16 w-16 text-gray-400" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {userProfile?.username || user?.email?.split('@')[0]}!
            </h1>
            <p className="text-sm text-gray-500">
              Here's what's happening with the solar inventory today.
            </p>
          </div>
        </div>
        
        <button
          onClick={loadData}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CubeIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Items in Database
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

      {/* Current Stock Levels Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Current Stock Levels</h3>
          <Link to="/inventory" className="text-sm font-medium text-orange-600 hover:text-orange-700">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Material Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Classification / Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Qty Levels</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
           <tbody className="bg-white divide-y divide-gray-200">
              {inventoryItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                    No inventory items found. Add some to get started!
                  </td>
                </tr>
              ) : (
                inventoryItems.slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.item_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.classification || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{item.category || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.qty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.qty <= 0 ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Out of Stock
                        </span>
                      ) : item.qty <= 10 ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <Link to={`/inventory/${item.id}`} className="text-gray-400 hover:text-orange-600 inline-block">
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      {isAdmin() && (
                        <Link to={`/inventory/edit/${item.id}`} className="text-gray-400 hover:text-green-600 inline-block">
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Inventory by Category
          </h3>
          <div className="h-64">
            {/* Swapped to our new dynamic data */}
            <Bar data={dynamicCategoryData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Stock Status Distribution
          </h3>
          <div className="h-64">
            {/* Swapped to our new dynamic data */}
            <Doughnut data={dynamicStockStatusData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {isAdmin() && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <Link
              to="/users"
              className="text-center p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
            >
              <UsersIcon className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Manage Users</span>
            </Link>

            <Link
              to="/inventory/add"
              className="text-center p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
            >
              <CubeIcon className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Add Product</span>
            </Link>

          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;