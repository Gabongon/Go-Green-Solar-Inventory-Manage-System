import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../App';
import { useAuth } from '../context/AuthContext';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  TrashIcon, 
  InformationCircleIcon,
  PencilIcon // <-- Added this icon
} from '@heroicons/react/24/outline';

const InventoryPage = () => {
  const { isAdmin } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('materials') 
        .select('*')
        .order('created_at', { ascending: false }); // Optional: latest first

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Error fetching materials:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // --- ADDED DELETE FUNCTIONALITY ---
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        const { error } = await supabase.from('materials').delete().eq('id', id);
        if (error) throw error;
        // Update local state to remove the item without refreshing
        setMaterials(materials.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error deleting material:', error.message);
        alert('Failed to delete material.');
      }
    }
  };

  const filteredMaterials = materials.filter((item) =>
    item.material_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Materials Inventory</h1>
        {isAdmin() && (
          <Link to="/inventory/add" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
            <PlusIcon className="h-5 w-5" /> Add Material
          </Link>
        )}
      </div>

      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search materials..."
          className="border border-gray-300 rounded-md py-2 pl-10 pr-4 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Material Details</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Category & Specs</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Classification</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Unit</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr><td colSpan="5" className="p-10 text-center text-gray-400">Loading from Database...</td></tr>
            ) : filteredMaterials.length === 0 ? (
              <tr><td colSpan="5" className="p-10 text-center text-gray-400">No materials found.</td></tr>
            ) : (
              filteredMaterials.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.image_url || 'https://via.placeholder.com/40'} 
                        className="h-10 w-10 rounded shadow-sm object-cover bg-gray-100" 
                        alt="" 
                      />
                      <div>
                        <div className="text-sm font-bold text-gray-900">{item.material_name}</div>
                        <div className="text-xs text-gray-500 max-w-[150px] truncate">{item.description}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                      {item.category || 'General'}
                    </span>
                    <div className="text-xs text-gray-600 mt-1 italic font-medium">
                      {item.specs || 'Standard Specs'}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.classification}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {item.unit_of_measure}
                  </td>

                  <td className="px-6 py-4 text-right space-x-2">
                    <Link to={`/inventory/${item.id}`} className="inline-block p-1.5 text-gray-400 hover:text-blue-600">
                      <InformationCircleIcon className="h-5 w-5" />
                    </Link>
                    
                    {/* --- ADDED EDIT BUTTON --- */}
                    {isAdmin() && (
                      <Link to={`/inventory/edit/${item.id}`} className="inline-block p-1.5 text-gray-400 hover:text-green-600">
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                    )}

                    {/* --- WIRED UP DELETE BUTTON --- */}
                    {isAdmin() && (
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryPage;