import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-r from-blue-600 to-teal-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Blog App</h3>
            <p className="text-blue-100 text-sm">
              A platform for sharing ideas, stories, and knowledge with the world.
              Join our community of writers and readers today.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-blue-100 hover:text-white transition">Home</Link>
              </li>
              <li>
                <Link to="/create" className="text-blue-100 hover:text-white transition">Create Post</Link>
              </li>
              <li>
                <Link to="/my-blogs" className="text-blue-100 hover:text-white transition">My Blogs</Link>
              </li>
              <li>
                <Link to="/support" className="text-blue-100 hover:text-white transition">Support</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy-policy" className="text-blue-100 hover:text-white transition">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-blue-100 hover:text-white transition">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-blue-300 border-opacity-20 text-center text-sm text-blue-200">
          <p>© {currentYear} Blog App. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 