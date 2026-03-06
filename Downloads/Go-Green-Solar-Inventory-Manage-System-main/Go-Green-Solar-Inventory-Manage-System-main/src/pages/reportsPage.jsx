import React from 'react';

const ReportsPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-4">Sustainability Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-bold text-green-800">Inventory Value</h3>
          <p className="text-2xl">₱ 0.00</p>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h3 className="font-bold text-orange-800">Pending Orders</h3>
          <p className="text-2xl">0</p>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;