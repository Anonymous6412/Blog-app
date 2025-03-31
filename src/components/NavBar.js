import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/firebaseConfig';

const NavBar = () => {
  const { currentUser, isAdmin } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Function to get user initials for the avatar
  const getUserInitials = () => {
    if (!currentUser || !currentUser.email) return '?';
    const parts = currentUser.email.split('@')[0].split(/[._-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return currentUser.email.charAt(0).toUpperCase();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  // Check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <div className="sticky top-0 z-50">
      {/* Glassmorphism effect for navbar */}
      <div className="backdrop-blur-md bg-white/70 border-b border-gray-200 shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">BlogApp</span>
            </Link>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={toggleMenu} 
                className="text-gray-700 hover:text-blue-600 focus:outline-none"
              >
                {isMenuOpen ? (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex md:items-center md:space-x-3">
              <Link 
                to="/" 
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive('/') 
                    ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                Home
              </Link>
              
              {currentUser ? (
                <>
                  <Link 
                    to="/create" 
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive('/create') 
                        ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    Create Blog
                  </Link>
                  
                  <Link 
                    to="/my-blogs" 
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive('/my-blogs') 
                        ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    My Blogs
                  </Link>
                  
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isActive('/admin') 
                          ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md' 
                          : 'text-blue-700 bg-blue-50 hover:bg-blue-100'
                      }`}
                    >
                      Admin
                    </Link>
                  )}

                  {/* User profile dropdown */}
                  <div className="relative profile-dropdown">
                    <button 
                      onClick={toggleProfile}
                      className="focus:outline-none"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                        {getUserInitials()}
                      </div>
                    </button>
                    
                    <div className={`absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 transition-all duration-300 transform origin-top-right ${
                      isProfileOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'
                    }`}>
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md">
                            {getUserInitials()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[160px]">{currentUser.email}</p>
                            {isAdmin && <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-md">Admin</span>}
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        <Link 
                          to="/profile" 
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          My Profile
                        </Link>
                        <button 
                          onClick={() => {
                            auth.signOut();
                            setIsProfileOpen(false);
                          }}
                          className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm9 8a1 1 0 01-1 1H5a1 1 0 110-2h6a1 1 0 011 1zm2-4a1 1 0 00-1-1H5a1 1 0 100 2h8a1 1 0 001-1z" clipRule="evenodd" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive('/login') 
                        ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md' 
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive('/signup') 
                        ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md' 
                        : 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Mobile menu */}
          <div 
            className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
              isMenuOpen ? "max-h-96 mt-4 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="flex flex-col space-y-2 pt-2 pb-4">
              <Link 
                to="/" 
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center ${
                  isActive('/') 
                    ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Home
              </Link>
              
              {currentUser ? (
                <>
                  <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md">
                      {getUserInitials()}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 truncate">{currentUser.email}</p>
                      {isAdmin && <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-md">Admin</span>}
                    </div>
                  </div>

                  <Link 
                    to="/create" 
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center ${
                      isActive('/create') 
                        ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                    </svg>
                    Create Blog
                  </Link>
                  
                  <Link 
                    to="/my-blogs" 
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center ${
                      isActive('/my-blogs') 
                        ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    My Blogs
                  </Link>
                  
                  <Link 
                    to="/profile" 
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center ${
                      isActive('/profile') 
                        ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    My Profile
                  </Link>
                  
                  <button 
                    onClick={() => {
                      auth.signOut();
                      setIsMenuOpen(false);
                    }}
                    className="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center text-red-600 hover:bg-red-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm9 8a1 1 0 01-1 1H5a1 1 0 110-2h6a1 1 0 011 1zm2-4a1 1 0 00-1-1H5a1 1 0 100 2h8a1 1 0 001-1z" clipRule="evenodd" />
                    </svg>
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center ${
                      isActive('/login') 
                        ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md' 
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                    </svg>
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center ${
                      isActive('/signup') 
                        ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md' 
                        : 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Gradient divider */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-teal-500 to-pink-500"></div>
    </div>
  );
};

export default NavBar;
