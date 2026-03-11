import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Adjust path if needed
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  TrashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const OrdersPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [materialsList, setMaterialsList] = useState([]);
  const [stockOrders, setStockOrders] = useState([]);
  
  // New Order Form States
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [cart, setCart] = useState([]); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const STATUSES = [
    'Pending Approval', 
    'Sourcing', 
    'Stock Ordered (In transit)', 
    'Stock Order Arrived', 
    'Stock Order Closed Inbound', 
    'Stock Order (cancelled)'
  ];

  const CATEGORIES = ['Consumables', 'Outdoor', 'Indoor', 'Protective Devices'];

  // --- 1. FETCH DATA ---
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // FETCH FROM 'materials' TABLE INSTEAD OF 'inventory'
      const { data: materialsData } = await supabase
        .from('materials')
        .select('id, material_name, category')
        .order('material_name');
        
      if (materialsData) setMaterialsList(materialsData);

      const { data: ordersData } = await supabase
        .from('stock_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersData) setStockOrders(ordersData);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load orders data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusCount = (statusName) => {
    return stockOrders.filter(order => order.status === statusName).length;
  };

  // --- Searchable Dropdown Logic ---
  const filteredMaterials = materialsList.filter(m => 
    m.material_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectMaterial = (material) => {
    setSelectedMaterialId(material.id.toString());
    setSearchTerm(material.material_name);
    setSelectedCategory(material.category || ''); // Auto-fill the category!
    setIsDropdownOpen(false);
  };

  // --- 3. HANDLE CART LOGIC ---
  const addToCart = () => {
    if (!selectedMaterialId || !selectedCategory || !quantity || quantity <= 0) {
      toast.error('Please select a material and enter a valid quantity.');
      return;
    }

    const materialDetails = materialsList.find(m => m.id.toString() === selectedMaterialId);

    const newItem = {
      material_id: materialDetails.id,
      item_name: materialDetails.material_name,
      category: selectedCategory,
      quantity: parseInt(quantity, 10)
    };

    setCart([...cart, newItem]);
    
    // Reset form fields
    setSelectedMaterialId('');
    setSearchTerm('');
    setSelectedCategory('');
    setQuantity('');
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  // --- 4. SUBMIT NEW ORDER ---
  const submitOrder = async () => {
    if (cart.length === 0) {
      toast.error('Add at least one item to the order.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const orderNo = `SO-${Date.now().toString().slice(-6)}`;
      
      const { data: newOrder, error: orderError } = await supabase
        .from('stock_orders')
        .insert([{
          order_number: orderNo,
          status: 'Pending Approval',
          total_items: cart.reduce((sum, item) => sum + item.quantity, 0),
          created_by: user?.id
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map(item => ({
        stock_order_id: newOrder.id,
        material_id: item.material_id,
        quantity: item.quantity,
        category: item.category
      }));

      const { error: itemsError } = await supabase
        .from('stock_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast.success(`Order ${orderNo} created successfully!`);
      
      setCart([]);
      fetchData();

    } catch (error) {
      console.error('Submission error:', error);
      toast.error(`Failed to submit order: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 5. UPDATE ORDER STATUS ---
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('stock_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      toast.success('Status updated!');
      fetchData(); 
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Orders...</div>;

  return (
    <div className="space-y-6">
      
      {/* HEADER & STATS CARDS */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Stock Orders</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="Pending Approval" count={getStatusCount('Pending Approval')} color="bg-yellow-50 text-yellow-700" />
          <StatCard title="Sourcing" count={getStatusCount('Sourcing')} color="bg-blue-50 text-blue-700" />
          <StatCard title="Stock Ordered" count={getStatusCount('Stock Ordered (In transit)')} color="bg-indigo-50 text-indigo-700" />
          <StatCard title="Order Arrived" count={getStatusCount('Stock Order Arrived')} color="bg-teal-50 text-teal-700" />
          <StatCard title="Closed Inbound" count={getStatusCount('Stock Order Closed Inbound')} color="bg-green-50 text-green-700" />
          <StatCard title="Cancelled" count={getStatusCount('Stock Order (cancelled)')} color="bg-red-50 text-red-700" />
        </div>
      </div>

      {/* CREATE ORDER SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ADD ITEMS FORM */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Create New Order</h2>
          
          <div className="space-y-4">
            
            {/* SEARCHABLE DROPDOWN */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Material *</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  className="block w-full border border-gray-300 rounded-md py-2 pl-9 pr-3 text-sm focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Type to search..."
                  value={searchTerm}
                  onFocus={() => setIsDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)} // Delay hiding so click registers
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedMaterialId(''); // Reset ID if they type something new
                    setIsDropdownOpen(true);
                  }}
                />
              </div>

              {/* DROPDOWN LIST */}
              {isDropdownOpen && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {filteredMaterials.length === 0 ? (
                    <li className="px-4 py-2 text-sm text-gray-500">No materials found.</li>
                  ) : (
                    filteredMaterials.map(item => (
                      <li 
                        key={item.id} 
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 cursor-pointer"
                        onMouseDown={() => handleSelectMaterial(item)} // Use onMouseDown to fire before input onBlur
                      >
                        {item.material_name}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <select 
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">-- Select Category --</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Qty *</label>
              <input 
                type="number" 
                min="1"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <button 
              onClick={addToCart}
              className="w-full bg-orange-100 text-orange-700 font-bold py-2 px-4 rounded border border-orange-200 hover:bg-orange-200 transition"
            >
              Add to Order List
            </button>
          </div>
        </div>

        {/* ORDER CART / SUMMARY */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Items to Order ({cart.length})</h2>
          
          <div className="flex-1 overflow-y-auto mb-4 min-h-[150px]">
            {cart.length === 0 ? (
              <p className="text-gray-400 text-center mt-10 italic">No items added to the order yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {cart.map((item, index) => (
                  <li key={index} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {item.item_name} <span className="text-orange-600">({item.quantity})</span>
                      </p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button 
            onClick={submitOrder}
            disabled={isSubmitting || cart.length === 0}
            className="w-full bg-orange-600 text-white font-bold py-3 px-4 rounded hover:bg-orange-700 disabled:opacity-50 transition mt-auto"
          >
            {isSubmitting ? 'Submitting Order...' : 'Submit Order'}
          </button>
        </div>
      </div>

      {/* ORDER HISTORY TABLE */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">Order History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order No.</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total Items</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date Created</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stockOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                    No orders found. Create one above!
                  </td>
                </tr>
              ) : (
                stockOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-600">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order.total_items} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select 
                        className="text-xs font-bold rounded-full px-2 py-1 border border-gray-300 bg-gray-50"
                        value={order.status || 'Pending Approval'}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button className="text-gray-400 hover:text-orange-600 font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

// Mini Component for the Status Cards at the top
const StatCard = ({ title, count, color }) => (
  <div className={`p-4 rounded-lg border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm ${color}`}>
    <p className="text-2xl font-black mb-1">{count}</p>
    <p className="text-[10px] uppercase font-bold tracking-wide opacity-80">{title}</p>
  </div>
);

export default OrdersPage;