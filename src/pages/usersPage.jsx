import React, { useEffect, useState } from 'react';
import { supabase } from '../App';
import { useAuth } from '../context/AuthContext';
import { 
  UserIcon, 
  ArrowPathIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ProfilesPage = () => { // Changed component name
  const { user: currentUser } = useAuth(); // Keeps 'user' here since it's from auth context
  const [profiles, setProfiles] = useState([]); // Changed state variables
  const [loading, setLoading] = useState(true);

  const AVAILABLE_ROLES = ['admin', 'Inventory manager', 'employee'];

  const fetchProfiles = async () => { // Changed function name
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles') 
        .select('*')
        .order('role', { ascending: true });

      if (error) throw error;
      setProfiles(data || []); // Updated state setter
    } catch (error) {
      toast.error('Could not load profiles. Check if profiles table exists.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const updateRole = async (profileId, newRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', profileId);

    if (error) {
      console.error("Database error:", error);
      // This will now show the exact error message on your screen!
      toast.error(`Failed to save: ${error.message}`); 
    } else {
      toast.success(`Profile is now ${newRole}`);
      setProfiles(profiles.map(p => p.id === profileId ? { ...p, role: newRole } : p));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Permissions</h1>
          <p className="text-sm text-gray-500">Assign roles to control access to materials</p>
        </div>
        <button onClick={fetchProfiles} className="btn-secondary flex items-center gap-2">
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Sync
        </button>
      </div>

      <div className="card overflow-hidden !p-0">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Profile / Username</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Current Role</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Change Permission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {profiles.map((p) => ( // Updated map variable
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={p.avatar_url || `https://ui-avatars.com/api/?name=${p.email}&background=random`} 
                      className="h-10 w-10 rounded-full border border-gray-200"
                      alt="profile"
                    />
                    <div>
                      <div className="text-sm font-bold text-gray-900">{p.email}</div>
                      <div className="text-xs text-primary-600 font-medium">@{p.username || 'no-username'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${
                     p.role === 'admin' ? 'bg-red-50 text-red-700 border-red-100' : 
                     p.role === 'Inventory manager' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                     'bg-green-50 text-green-700 border-green-100'
                   }`}>
                     {p.role || 'employee'}
                   </span>
                </td>
                <td className="px-6 py-4">
                  <select
                    className="input-field py-1 text-sm w-full max-w-[180px]"
                    value={p.role || 'employee'}
                    onChange={(e) => updateRole(p.id, e.target.value)}
                    disabled={p.id === currentUser?.id}
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

export default ProfilesPage;