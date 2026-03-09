import React, { useEffect, useState } from 'react';
import { supabase } from '../App';
import { useAuth } from '../context/AuthContext';
import { 
  UserIcon, 
  ArrowPathIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Exact roles requested
  const AVAILABLE_ROLES = ['admin', 'Inventory manager', 'employee'];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetching from the new 'profiles' table we just created
      const { data, error } = await supabase
        .from('profiles') 
        .select('*')
        .order('role', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast.error('Could not load users. Check if profiles table exists.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (userId, newRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      toast.error('Failed to update role');
    } else {
      toast.success(`User is now ${newRole}`);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Permissions</h1>
          <p className="text-sm text-gray-500">Assign roles to control access to materials</p>
        </div>
        <button onClick={fetchUsers} className="btn-secondary flex items-center gap-2">
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Sync
        </button>
      </div>

      <div className="card overflow-hidden !p-0">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">User / Username</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Current Role</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Change Permission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.email}&background=random`} 
                      className="h-10 w-10 rounded-full border border-gray-200"
                      alt="profile"
                    />
                    <div>
                      <div className="text-sm font-bold text-gray-900">{u.email}</div>
                      <div className="text-xs text-primary-600 font-medium">@{u.username || 'no-username'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${
                     u.role === 'admin' ? 'bg-red-50 text-red-700 border-red-100' : 
                     u.role === 'Inventory manager' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                     'bg-green-50 text-green-700 border-green-100'
                   }`}>
                     {u.role || 'employee'}
                   </span>
                </td>
                <td className="px-6 py-4">
                  <select
                    className="input-field py-1 text-sm w-full max-w-[180px]"
                    value={u.role || 'employee'}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                    disabled={u.id === currentUser?.id}
                  >
                    {AVAILABLE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;