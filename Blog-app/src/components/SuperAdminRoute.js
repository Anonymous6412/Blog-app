import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SuperAdminRoute = ({ children }) => {
  const { currentUser, loading, isSuperAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex justify-center items-center">
        <div className="text-lg text-indigo-600 animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-medium text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">
            Checking authorization...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser || !isSuperAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

export default SuperAdminRoute; 