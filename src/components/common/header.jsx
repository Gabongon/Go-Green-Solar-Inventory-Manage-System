import React, { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient'; // Make sure this path is correct for your project!
import { Menu, Transition } from '@headlessui/react';
import { 
  Bars3Icon, 
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  // FETCH PROFILE DATA FROM SUPABASE
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (data) setProfile(data);
      } catch (error) {
        console.error('Error fetching profile for header:', error);
      }
    };

    fetchProfile();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Create a display name for the header and fallback avatar
  const displayName = profile?.username || user?.email?.split('@')[0] || 'User';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section */}
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-600 lg:hidden"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <Link to="/dashboard" className="ml-4 lg:ml-0">
              <h1 className="text-xl font-bold text-primary-600">Solar<span className="text-secondary-600">Inventory</span></h1>
            </Link>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            {/* User menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full">
                
                {/* DYNAMIC PROFILE PICTURE */}
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f97316&color=fff`}
                    alt="Default Avatar"
                    className="h-8 w-8 rounded-full"
                  />
                )}
                
                {/* DYNAMIC USERNAME */}
                <span className="hidden md:block text-gray-700 font-medium">
                  {displayName}
                </span>

              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } flex items-center px-4 py-2 text-sm text-gray-700`}
                        >
                          <UserCircleIcon className="h-5 w-5 mr-2 text-gray-400" />
                          Your Profile
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/settings"
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } flex items-center px-4 py-2 text-sm text-gray-700`}
                        >
                          <Cog6ToothIcon className="h-5 w-5 mr-2 text-gray-400" />
                          Settings
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } flex items-center w-full text-left px-4 py-2 text-sm text-gray-700`}
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2 text-gray-400" />
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;