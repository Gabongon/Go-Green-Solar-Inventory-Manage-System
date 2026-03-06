import React from 'react';

const OrdersPage = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold text-orange-600 mb-4">Solar Project Orders</h1>
      <p className="text-gray-600 italic">Placeholder: Use Supabase to fetch 'orders' table here.</p>
      <div className="mt-4 p-4 border-2 border-dashed border-gray-200 rounded text-center">
        No active solar installations found.
      </div>
    </div>
  );
};

export default OrdersPage;