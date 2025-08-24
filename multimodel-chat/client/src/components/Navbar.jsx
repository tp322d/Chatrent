import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, MessageSquare, Settings, History, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">MultiModel Chat</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/chat"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/chat')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Chat
                </Link>
                <Link
                  to="/history"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/history')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  History
                </Link>
                <Link
                  to="/settings"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/settings')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Settings
                </Link>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user.name}</span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-600 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{user.name}</span>
                    </div>
                  </div>
                  
                  <Link
                    to="/chat"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive('/chat')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Chat
                  </Link>
                  <Link
                    to="/history"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive('/history')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    History
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive('/settings')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;