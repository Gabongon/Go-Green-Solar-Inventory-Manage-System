import React from 'react';

const UsersPage = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">User Management</h2>
      <table className="w-full border-collapse border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="border p-2 text-left">Staff Name</th>
            <th className="border p-2 text-left">Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2 text-gray-400">Loading staff list...</td>
            <td className="border p-2">-</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default UsersPage;