import React from 'react';

const SettingsPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>
      <div className="space-y-4">
        <label className="flex items-center space-x-3">
          <input type="checkbox" className="form-checkbox h-5 w-5 text-orange-600" />
          <span>Enable Email Notifications for low stock</span>
        </label>
      </div>
    </div>
  );
};

export default SettingsPage;