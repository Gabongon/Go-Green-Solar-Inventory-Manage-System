import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border-t-4 border-orange-500">
      <h1 className="text-xl font-bold mb-4">My Profile</h1>
      <p className="mb-2"><strong>Email:</strong> {user?.email || 'Not logged in'}</p>
      <p><strong>System ID:</strong> {user?.id || 'N/A'}</p>
    </div>
  );
};

export default ProfilePage;