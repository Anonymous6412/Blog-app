import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/firebaseConfig';
import './HomePage.css';

const Header = () => {
  const { currentUser } = useAuth();

  return (
    <header>
      <nav>
        <Link to="/">Home</Link>
        {currentUser ? (
          <>
            <span>Welcome, {currentUser.email}</span>
            <Link to="/create">Create Post</Link>
            <button onClick={() => auth.signOut()}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
