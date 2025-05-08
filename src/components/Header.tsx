import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { LuUser, LuLogOut, LuBookOpen, LuShield } from 'react-icons/lu';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm py-4">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-600">
            <LuBookOpen className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl">Flipbook Viewer</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-8">
          <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 font-medium">
            Home
          </Link>
          <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 font-medium">
            Explore
          </a>
          <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 font-medium">
            Categories
          </a>
          <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 font-medium">
            About
          </a>
        </nav>

        {/* Search Bar */}
        <div className="hidden md:flex items-center relative">
          <input
            type="text"
            placeholder="Search stories..."
            className="bg-gray-100 dark:bg-gray-700 border-0 rounded-full py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm w-56"
          />
          <svg
            className="absolute right-3 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl} alt={user?.username || 'User'} />
                  <AvatarFallback className="bg-violet-100 text-violet-600">{user?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">{user?.username}</span>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium">{user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.isAdmin ? 'Administrator' : 'User'}</p>
                  </div>

                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left flex items-center"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <LuBookOpen className="mr-2 h-4 w-4" /> My Stories
                  </Link>

                  {user?.isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left flex items-center"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <LuShield className="mr-2 h-4 w-4" /> Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left flex items-center"
                  >
                    <LuLogOut className="mr-2 h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="hidden md:flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400">
                  <LuUser className="h-4 w-4" /> Sign In
                </Button>
              </Link>
              <Link to="/login">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                  Sign Up
                </Button>
              </Link>
            </>
          )}

          <button className="md:hidden text-gray-700 dark:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
