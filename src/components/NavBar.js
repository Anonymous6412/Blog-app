import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './NavBar.css'; // Import the NavBar styles
import { auth } from '../firebase/firebaseConfig';

const NavBar = () => {
  const { currentUser, isAdmin } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          BlogApp
        </Link>
        <div className="navbar-links">
          <Link to="/" className="navbar-link">Home</Link>
          {currentUser ? (
            <>
              <span className="navbar-welcome">
                Welcome, {currentUser.email}
                {isAdmin && <span className="admin-badge">Admin</span>}
              </span>
              <Link to="/create" className="navbar-link">Create Post</Link>
              {isAdmin && (
                <Link to="/admin" className="navbar-link admin-link">Admin Panel</Link>
              )}
              <button className="navbar-btn" onClick={() => auth.signOut()}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/signup" className="navbar-link">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
