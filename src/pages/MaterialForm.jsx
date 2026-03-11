import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../App';

const MaterialForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  
  // Set everything to blank by default so it's not confusing
  const [formData, setFormData] = useState({
    material_name: '',
    classification: '', 
    specs: '',
    unit_of_measure: '', 
    description: '',
    category: '', 
    image_url: ''
  });

  // Your requested dropdown options
  const classifications = ['solar panel', 'inverter', 'battery', 'cables/wires', 'raceway materials', 'mounting kits', 'breakers', 'protective'];
  const categories = ['consumables', 'outdoor', 'indoor', 'protectives'];
  const units = ['pieces', 'meters', 'sets', 'roll', 'packs'];

  useEffect(() => {
    if (isEditing) {
      const fetchMaterial = async () => {
        const { data, error } = await supabase
          .from('materials')
          .select('*')
          .eq('id', id)
          .single();

        if (error) console.error('Error fetching material:', error);
        else if (data) setFormData(data);
      };
      fetchMaterial();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.image_url;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `materials/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('material-images')
      .upload(filePath, imageFile);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('material-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let uploadedImageUrl = formData.image_url;
      if (imageFile) {
        uploadedImageUrl = await uploadImage();
      }

      const payload = { ...formData, image_url: uploadedImageUrl };

      if (isEditing) {
        const { error } = await supabase.from('materials').update(payload).eq('id', id);
        if (error) throw error;
        alert('Material updated successfully!');
      } else {
        const { error } = await supabase.from('materials').insert([payload]);
        if (error) throw error;
        alert('Material added successfully!');
      }

      navigate('/inventory');
    } catch (error) {
      console.error('Full Error Details:', error);
      alert(`Failed to save: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {isEditing ? 'Edit Material' : 'Add New Material'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Material Name</label>
          <input type="text" name="material_name" value={formData.material_name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Classification</label>
          <select name="classification" value={formData.classification} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2">
            <option value="" disabled>Select a classification...</option>
            {classifications.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select name="category" value={formData.category} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2">
            <option value="" disabled>Select a category...</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Specs</label>
            <input type="text" name="specs" value={formData.specs} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Unit of Measure</label>
            <select name="unit_of_measure" value={formData.unit_of_measure} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2">
              <option value="" disabled>Select unit...</option>
              {units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image Upload</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="mt-1 block w-full" />
          {formData.image_url && !imageFile && (
            <img src={formData.image_url} alt="Current" className="mt-2 h-20 w-20 object-cover rounded" />
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => navigate('/inventory')} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Material'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaterialForm;