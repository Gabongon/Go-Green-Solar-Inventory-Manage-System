import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { 
  InboxArrowDownIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';

const InboundPage = () => {
  const [loading, setLoading] = useState(true);
  const [inboundOrders, setInboundOrders] = useState([]);
  const [materialsMap, setMaterialsMap] = useState({});
  
  // Selection States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- 1. FETCH ORDERS READY FOR INBOUND ---
  const fetchInboundData = async () => {
    try {
      setLoading(true);

      // Fetch all materials so we can map IDs to Names safely
      const { data: materialsData } = await supabase.from('materials').select('*');
      const matMap = {};
      if (materialsData) {
        materialsData.forEach(m => {
          matMap[m.id] = m;
        });
      }
      setMaterialsMap(matMap);

      // Fetch orders that have arrived but aren't closed yet
      const { data: ordersData, error } = await supabase
        .from('stock_orders')
        .select('*')
        .in('status', ['Stock Ordered (In transit)', 'Stock Order Arrived'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInboundOrders(ordersData || []);

    } catch (error) {
      console.error('Error fetching inbound data:', error);
      toast.error('Failed to load inbound orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInboundData();
  }, []);

  // --- 2. VIEW ORDER DETAILS ---
  const handleSelectOrder = async (order) => {
    setSelectedOrder(order);
    try {
      const { data, error } = await supabase
        .from('stock_order_items')
        .select('*')
        .eq('stock_order_id', order.id);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      toast.error('Could not load order items.');
    }
  };

  // --- 3. PROCESS THE INBOUND (THE MAGIC HAPPENS HERE) ---
  const processInbound = async () => {
    if (!selectedOrder || orderItems.length === 0) return;
    
    // Ask for confirmation to prevent accidental clicks
    if (!window.confirm(`Are you sure you want to receive ${selectedOrder.order_number} into inventory?`)) return;

    try {
      setIsProcessing(true);

      // Loop through every item in the order to update the Inventory
      for (const item of orderItems) {
        const material = materialsMap[item.material_id];
        if (!material) continue; // Skip if material was deleted from database

        // 1. Check if this item already exists in the 'inventory' table
        const { data: existingInv, error: searchError } = await supabase
          .from('inventory')
          .select('*')
          .eq('item_name', material.material_name)
          .single();

        let currentInvId = null;

        if (existingInv) {
          // UPDATE EXISTING INVENTORY
          const newQty = (existingInv.qty || 0) + item.quantity;
          const { error: updateError } = await supabase
            .from('inventory')
            .update({ qty: newQty })
            .eq('id', existingInv.id);
            
          if (updateError) throw updateError;
          currentInvId = existingInv.id;
        } else {
          // INSERT NEW INVENTORY ITEM
          const { data: newInv, error: insertError } = await supabase
            .from('inventory')
            .insert([{
              item_name: material.material_name,
              category: material.category,
              classification: material.classification,
              qty: item.quantity,
              reference_so: selectedOrder.order_number
            }])
            .select()
            .single();
            
          if (insertError) throw insertError;
          currentInvId = newInv.id;
        }

        // 2. Log this movement in 'stock_movements'
        if (currentInvId) {
          await supabase.from('stock_movements').insert([{
            inventory_id: currentInvId,
            movement_type: 'IN',
            quantity: item.quantity,
            job_order_no: selectedOrder.order_number
          }]);
        }
      }

      // 3. Mark the Order as Closed
      const { error: orderUpdateError } = await supabase
        .from('stock_orders')
        .update({ status: 'Stock Order Closed Inbound' })
        .eq('id', selectedOrder.id);

      if (orderUpdateError) throw orderUpdateError;

      toast.success(`${selectedOrder.order_number} successfully received into Inventory!`);
      
      // Reset UI
      setSelectedOrder(null);
      setOrderItems([]);
      fetchInboundData(); // Refresh the list

    } catch (error) {
      console.error('Inbound Processing Error:', error);
      toast.error(`Failed to process inbound: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Inbound Orders...</div>;

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Inbound Receiving</h1>
        <p className="text-gray-500 text-sm">Review arriving stock orders and process them directly into your live inventory.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: PENDING INBOUND ORDERS */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <InboxArrowDownIcon className="h-5 w-5 text-orange-600" /> 
              Expected Deliveries
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {inboundOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-400 italic mt-10">
                No expected deliveries right now.
              </div>
            ) : (
              <ul className="space-y-2">
                {inboundOrders.map((order) => (
                  <li 
                    key={order.id}
                    onClick={() => handleSelectOrder(order)}
                    className={`p-4 rounded-lg cursor-pointer border transition-all ${
                      selectedOrder?.id === order.id 
                        ? 'bg-orange-50 border-orange-300 ring-1 ring-orange-300' 
                        : 'bg-white border-gray-100 hover:border-orange-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-900">{order.order_number}</span>
                      <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                        {order.total_items} items
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      <span className="italic">{order.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ORDER PROCESSING */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[600px]">
          {!selectedOrder ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6">
              <ArchiveBoxIcon className="h-16 w-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">Select a delivery to review</p>
              <p className="text-sm">Click an order from the left panel to see its contents.</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedOrder.order_number}</h2>
                  <p className="text-sm text-gray-500">Review items before adding to inventory</p>
                </div>
                <span className="badge-warning">{selectedOrder.status}</span>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <table className="min-w-full divide-y divide-gray-200 border rounded-lg overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Material</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Expected Qty</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {orderItems.map((item) => {
                      const mat = materialsMap[item.material_id];
                      return (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {mat?.material_name || 'Unknown Material'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {item.category || mat?.category}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                            +{item.quantity}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-6 border-t border-gray-200 bg-white">
                <button
                  onClick={processInbound}
                  disabled={isProcessing}
                  className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-sm"
                >
                  {isProcessing ? (
                    'Processing Inventory...'
                  ) : (
                    <>
                      <CheckBadgeIcon className="h-6 w-6" />
                      Receive Items & Update Inventory
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InboundPage;