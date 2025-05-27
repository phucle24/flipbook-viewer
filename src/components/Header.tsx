import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { useContrastMode } from '../lib/contrastMode';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { LuUser, LuLogOut, LuBookOpen, LuShield, LuEye, LuEyeOff } from 'react-icons/lu';

/**
 * Custom pastel gradient, child-friendly header for Storyland.
 * Requires the following custom Tailwind classes in your CSS:
 *
 * .bg-gradient-purple-cotton {
 *   background: linear-gradient(90deg, #b39ddb 0%, #ffd6ec 100%);
 * }
 * .text-sunshine-yellow { color: #ffe066; }
 * .bg-cotton-candy { background-color: #ffd6ec; }
 * .text-cotton-candy { color: #ffd6ec; }
 * .text-lilac-purple { color: #a084ca; }
 * .bg-baby-blue { background-color: #cce6ff; }
 * .border-baby-blue { border-color: #cce6ff; }
 * .hover\:bg-sunshine-yellow:hover { background-color: #ffe066; }
 * .hover\:text-lilac-purple:hover { color: #a084ca; }
 * .font-fredoka { font-family: 'Fredoka One', cursive; }
 * .font-baloo { font-family: 'Baloo 2', cursive; }
 * .font-quicksand { font-family: 'Quicksand', sans-serif; }
 * .text-glow-yellow { text-shadow: 0 0 8px #ffe066, 0 0 2px #ffe066; }
 * .text-title-shadow { text-shadow: 2px 2px 0 #fffbe7, 0 0 8px #ffe066; }
 * .hover-bounce { transition: transform 0.2s; }
 * .hover-bounce:hover { transform: scale(1.08) translateY(-2px); }
 *
 * Make sure to import the Fredoka One, Baloo 2, and Quicksand fonts in your index.html or via @import.
 */

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { contrastMode, toggleContrastMode } = useContrastMode();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileMenuOpen(false);
  };

  return (
    <header className="bg-gradient-purple-cotton shadow-md py-4">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-purple-cotton shadow-lg">
            <LuBookOpen className="w-7 h-7 text-white" />
          </div>
          <span className="font-fredoka text-sunshine-yellow font-bold text-3xl text-glow-yellow text-title-shadow drop-shadow transition">
            Storyland
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-8">
          <Link to="/" className="text-lilac-purple font-baloo font-semibold hover:text-cotton-candy hover-bounce transition text-lg">
            Home
          </Link>
          <a href="#" className="text-lilac-purple font-baloo hover:text-cotton-candy hover-bounce transition text-lg">
            Explore
          </a>
          <a href="#" className="text-lilac-purple font-baloo hover:text-cotton-candy hover-bounce transition text-lg">
            Categories
          </a>
          <a href="#" className="text-lilac-purple font-baloo hover:text-cotton-candy hover-bounce transition text-lg">
            About
          </a>
        </nav>

        {/* Search Bar */}
        <div className="hidden md:flex items-center relative">
          <input
            type="text"
            placeholder="Tìm truyện..."
            className="bg-baby-blue border-0 rounded-full py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-cotton-candy text-sm w-56 font-quicksand"
          />
          <svg
            className="absolute right-3 w-5 h-5 text-lilac-purple"
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
          {/* Contrast Mode Toggle */}
          <button
            onClick={toggleContrastMode}
            className="rounded-full p-2 bg-blue-accent text-white hover-bounce"
            aria-label={contrastMode ? "Turn off contrast mode" : "Turn on contrast mode"}
            title={contrastMode ? "Turn off contrast mode" : "Turn on contrast mode"}
          >
            {contrastMode ? <LuEyeOff className="h-5 w-5" /> : <LuEye className="h-5 w-5" />}
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 hover-bounce"
              >
                <Avatar className="h-8 w-8 border-2 border-cotton-candy">
                  <AvatarImage src={user?.avatarUrl} alt={user?.username || 'User'} />
                  <AvatarFallback className="bg-cotton-candy text-white font-baloo">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block font-baloo text-lilac-purple">
                  {user?.username}
                </span>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg py-1 z-50 border border-baby-blue">
                  <div className="px-4 py-2 border-b border-baby-blue">
                    <p className="text-sm font-medium font-baloo text-lilac-purple">{user?.username}</p>
                    <p className="text-xs text-gray-400">{user?.isAdmin ? 'Quản trị viên' : 'Thành viên'}</p>
                  </div>

                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm text-lilac-purple hover:bg-baby-blue hover-bounce font-baloo w-full text-left flex items-center"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <LuBookOpen className="mr-2 h-4 w-4" /> Truyện của tôi
                  </Link>

                  {user?.isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-sm text-lilac-purple hover:bg-baby-blue hover-bounce w-full text-left flex items-center font-baloo"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <LuShield className="mr-2 h-4 w-4" /> Quản trị
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm text-lilac-purple hover:bg-cotton-candy hover-bounce w-full text-left flex items-center font-baloo"
                  >
                    <LuLogOut className="mr-2 h-4 w-4" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="hidden md:flex items-center gap-2 text-lilac-purple hover:text-cotton-candy hover-bounce font-baloo text-lg">
                  <LuUser className="h-4 w-4" /> Đăng nhập
                </Button>
              </Link>
              <Link to="/login">
                <Button className="bg-cotton-candy hover:bg-sunshine-yellow hover:text-lilac-purple font-baloo text-lg px-4 py-2 rounded-full hover-bounce">
                  Đăng ký
                </Button>
              </Link>
            </>
          )}

          <button className="md:hidden text-lilac-purple hover:text-cotton-candy">
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
