import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';
import { UserCircleIcon, CameraIcon, PhoneIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    phone_number: '',
    avatar_url: '',
  });

  // Fetch profile data from your custom 'profiles' table
  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('username, phone_number, avatar_url')
          .eq('id', user.id)
          .single();

        if (data) setProfile(data);
        if (error && error.code !== 'PGRST116') throw error;
      } catch (error) {
        console.error('Error loading profile:', error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) getProfile();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    // New Validation Step
  if (profile.phone_number && !validatePhone(profile.phone_number)) {
    return toast.error("Please enter a valid phone number (e.g., +639123456789)");
  }
    setLoading(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      ...profile,
      updated_at: new Date(),
    });

    if (error) toast.error(error.message);
    else toast.success('Profile updated!');
    setLoading(false);
  };

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) throw new Error('Select an image.');

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage Bucket named 'avatars'
      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setProfile({ ...profile, avatar_url: data.publicUrl });
      toast.success('Avatar uploaded! Click Save to confirm.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };
  const validatePhone = (phone) => {
  // Pattern: Optional +, then 10-14 digits
  const regex = /^\+?[0-9]{10,14}$/;
  return regex.test(phone);
};


  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="bg-orange-500 h-32"></div>
        <div className="px-6 pb-6">
          <div className="relative -mt-16 mb-6 flex justify-center">
            <div className="relative">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg" />
              ) : (
                <UserCircleIcon className="h-32 w-32 rounded-full border-4 border-white bg-gray-100 text-gray-400 shadow-lg" />
              )}
              <label className="absolute bottom-0 right-0 bg-orange-600 p-2 rounded-full cursor-pointer hover:bg-orange-700 transition-colors shadow-md">
                <CameraIcon className="h-5 w-5 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} disabled={uploading} />
              </label>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{profile.username || 'New User'}</h1>
            <div className="flex justify-center items-center gap-2 text-gray-500 mt-1">
              <ShieldCheckIcon className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium uppercase tracking-wider">{isAdmin() ? 'Administrator' : 'Employee'}</span>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <UserIcon className="h-4 w-4" /> Username
              </label>
              <input
                type="text"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter username"
              />
            </div>

           <div className="space-y-1">
  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
    <PhoneIcon className="h-4 w-4" /> Phone Number
  </label>
  <input
    type="text"
    value={profile.phone_number}
    onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
    className={`w-full px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 ${
      profile.phone_number && !validatePhone(profile.phone_number) 
      ? 'border-red-500 bg-red-50' 
      : 'border-gray-300'
    }`}
    placeholder="+639123456789"
  />
  {profile.phone_number && !validatePhone(profile.phone_number) && (
    <p className="text-xs text-red-600 mt-1">Invalid format. Use +63 followed by 10 digits.</p>
  )}
</div>

            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving Changes...' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;