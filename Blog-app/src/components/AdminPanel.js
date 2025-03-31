import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebaseConfig';
import {
  collection, query, where, getDocs, updateDoc, doc
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [permissions, setPermissions] = useState({
    canRead: true,
    canPost: true,
    canEdit: true,
    canDelete: true,
    suspended: false
  });
  
  const { 
    currentUser, 
    isAdmin, 
    isSuperAdmin, 
    toggleAdminStatus,
    updateUserPermissions,
    getLoginLogs,
    loading: authLoading 
  } = useAuth();
  
  const navigate = useNavigate();

  const [loginLogs, setLoginLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logSearchTerm, setLogSearchTerm] = useState('');

  // Redirect non-admin users away from this page
  useEffect(() => {
    // Only check once auth has finished loading
    if (authLoading) return;
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (!isAdmin && !isSuperAdmin) {
      navigate('/');
      return;
    }
    
    fetchUsers();
  }, [currentUser, isAdmin, isSuperAdmin, navigate, authLoading]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdminStatus = async (userId, currentStatus) => {
    try {
      // Only super admins can change admin status
      if (!isSuperAdmin) {
        setError("Only Super Admins can change admin status");
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      await toggleAdminStatus(userId, currentStatus);
      
      // Update local state
      setUsers(users.map(user => 
        user.uid === userId 
          ? { ...user, isAdmin: !currentStatus } 
          : user
      ));
      
      setMessage(`User admin status updated successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error updating admin status:', err);
      setError(err.message || 'Failed to update admin status. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };
  
  const handleToggleSuperAdmin = async (userId, currentStatus) => {
    try {
      // Only super admins can change super admin status
      if (!isSuperAdmin) {
        setError("Only Super Admins can set Super Admin status");
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      // Prevent modifying another super admin's status
      if (currentStatus && userId !== currentUser?.uid) {
        setError("Cannot modify another Super Admin's status");
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      // Toggle super admin status
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        isSuperAdmin: !currentStatus
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.uid === userId 
          ? { ...user, isSuperAdmin: !currentStatus } 
          : user
      ));
      
      setMessage(`User super admin status updated successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error updating super admin status:', err);
      setError(err.message || 'Failed to update super admin status. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditPermissions = (user) => {
    setEditingUser(user);
    setPermissions(user.permissions || {
      canRead: true,
      canPost: true,
      canEdit: true,
      canDelete: true,
      suspended: false
    });
    setShowPermissionsModal(true);
  };

  const handleSavePermissions = async () => {
    try {
      await updateUserPermissions(editingUser.uid, permissions);
      
      // Update local state
      setUsers(users.map(user => 
        user.uid === editingUser.uid 
          ? { ...user, permissions: permissions } 
          : user
      ));
      
      setMessage(`User permissions updated successfully!`);
      setShowPermissionsModal(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error updating user permissions:', err);
      setError(err.message || 'Failed to update user permissions. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const addNewAdmin = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter an email address.');
      return;
    }
    
    // Only super admins can add new admins
    if (!isSuperAdmin) {
      setError("Only Super Admins can add new admins");
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    try {
      // First, find the user in the database
      const usersRef = collection(db, 'users');
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);
      
      let userFound = false;
      
      for (const docSnapshot of querySnapshot.docs) {
        if (docSnapshot.data().email === email) {
          // User found, update their admin status
          await updateDoc(doc(db, 'users', docSnapshot.id), {
            isAdmin: true
          });
          
          setMessage(`User ${email} has been granted admin privileges.`);
          userFound = true;
          
          // Refresh user list
          fetchUsers();
          break;
        }
      }
      
      if (!userFound) {
        setError(`User with email ${email} not found. They need to register first.`);
      }
      
      // Clear the form
      setEmail('');
    } catch (err) {
      console.error('Error adding new admin:', err);
      setError('Failed to add new admin. Please try again.');
    }
    
    // Clear messages after a delay
    setTimeout(() => {
      setMessage('');
      setError('');
    }, 3000);
  };

  // Initialize super admin if needed
  const initialiseSuperAdmin = useCallback(async () => {
    try {
      if (!currentUser || !isSuperAdmin) return;
      
      console.log("Checking super admin initialization...");
      
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where("email", "==", currentUser.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        
        if (!userData.isSuperAdmin) {
          console.log("Setting current user as super admin");
          await updateDoc(doc(db, 'users', userDoc.id), {
            isSuperAdmin: true,
            isAdmin: true,
          });
          setMessage("Super admin status initialized.");
        }
      }
    } catch (err) {
      console.error("Error initializing super admin:", err);
      setError("Failed to initialize super admin status.");
    }
  }, [currentUser, isSuperAdmin]);

  // Fetch login logs
  const fetchLoginLogs = useCallback(async () => {
    try {
      setLoading(true);
      const logsCollection = collection(db, 'login_logs');
      const logsSnapshot = await getDocs(logsCollection);
      
      const logs = logsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by timestamp (newest first)
      const sortedLogs = logs.sort((a, b) => {
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        return b.timestamp - a.timestamp;
      });
      
      setLoginLogs(sortedLogs);
    } catch (err) {
      console.error("Error fetching login logs:", err);
      setError("Failed to load login activity.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if super admin exists, if not and this is the first user, make them super admin
  useEffect(() => {
    if (!loading && users.length > 0) {
      const superAdminExists = users.some(user => user.isSuperAdmin);
      if (!superAdminExists) {
        initialiseSuperAdmin();
      }
    }
  }, [loading, users]);

  useEffect(() => {
    if (!authLoading && currentUser && isSuperAdmin) {
      initialiseSuperAdmin();
    }
  }, [authLoading, currentUser, isSuperAdmin, initialiseSuperAdmin]);

  useEffect(() => {
    if (activeTab === 'activity' && currentUser && (isAdmin || isSuperAdmin)) {
      fetchLoginLogs();
    }
  }, [activeTab, currentUser, isAdmin, isSuperAdmin, fetchLoginLogs]);

  // Render login logs section
  const renderLoginLogs = () => {
    if (!isSuperAdmin) return null;

    // Filter logs based on search term
    const filteredLogs = loginLogs.filter(log => 
      !logSearchTerm || 
      (log.email && log.email.toLowerCase().includes(logSearchTerm.toLowerCase()))
    );

    return (
      <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">User Login Logs</h2>
        
        {/* Filter input */}
        <div className="mb-4">
          <div className="relative rounded-md shadow-sm">
            <input
              type="text"
              placeholder="Filter by email..."
              className="block w-full pr-10 sm:text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              value={logSearchTerm}
              onChange={(e) => setLogSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
        
        {loadingLogs ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Time</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Info</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log, index) => (
                  <tr key={log.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.timestamp ? new Date(log.timestamp.toDate()).toLocaleString() : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="text-xs">
                        <p>Platform: {log.deviceInfo?.platform || 'Unknown'}</p>
                        <p className="truncate max-w-xs">Browser: {log.deviceInfo?.userAgent || 'Unknown'}</p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No login logs found</p>
        )}
      </div>
    );
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex justify-center items-center">
        <div className="text-lg text-amber-600 animate-pulse flex flex-col items-center">
          <div className="w-20 h-20 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-medium text-xl bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-sky-50 px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
            Admin Dashboard
          </h1>
          <div className="h-1.5 w-40 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full mt-3"></div>
          <p className="mt-4 text-gray-600">
            Manage users, permissions and view system statistics
          </p>
        </div>
        
        {/* Admin Tools Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Admin Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 shadow-sm">
              <h3 className="font-medium text-blue-700 mb-2">User Management</h3>
              <p className="text-sm text-gray-600 mb-4">Manage users and assign roles</p>
              <button 
                onClick={() => {
                  setActiveTab('users');
                  // Slight delay to ensure the tab has changed before scrolling
                  setTimeout(() => {
                    const usersSection = document.getElementById('usersSection');
                    if (usersSection) {
                      usersSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}
                className="text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors cursor-pointer"
              >
                <span>Manage Users</span>
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200 shadow-sm">
              <h3 className="font-medium text-teal-700 mb-2">Activity Logs</h3>
              <p className="text-sm text-gray-600 mb-4">View system activity history</p>
              <a 
                href="/admin/logs"
                className="text-sm text-teal-600 hover:text-teal-800 font-medium flex items-center"
              >
                <span>View Logs</span>
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            
            <div className="bg-gradient-to-br from-sky-50 to-sky-100 p-4 rounded-lg border border-sky-200 shadow-sm">
              <h3 className="font-medium text-sky-700 mb-2">Deleted Content</h3>
              <p className="text-sm text-gray-600 mb-4">Manage deleted users and posts</p>
              <a 
                href="/admin/deleted-content"
                className="text-sm text-sky-600 hover:text-sky-800 font-medium flex items-center"
              >
                <span>Restore Content</span>
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        {/* Admin Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-gray-500 text-sm">Total Users</p>
                <h3 className="font-bold text-2xl text-gray-800">{users.length}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-teal-100 text-teal-600">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-gray-500 text-sm">Admin Users</p>
                <h3 className="font-bold text-2xl text-gray-800">
                  {users.filter(user => user.isAdmin || user.isSuperAdmin).length}
                </h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-sky-100 text-sky-600">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-gray-500 text-sm">Super Admins</p>
                <h3 className="font-bold text-2xl text-gray-800">
                  {users.filter(user => user.isSuperAdmin).length}
                </h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-gray-500 text-sm">Active Now</p>
                <h3 className="font-bold text-2xl text-gray-800">
                  {users.filter(user => !user.suspended).length}
                </h3>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Admin Panel Content */}
        <div id="usersSection" className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <button
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'users'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                onClick={() => setActiveTab('users')}
              >
                Manage Users
              </button>
              <button
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'permissions'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                onClick={() => setActiveTab('permissions')}
              >
                User Permissions
              </button>
            </div>
            
            <div className="w-full md:w-64">
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  placeholder="Search by email..."
                  className="block w-full pr-10 sm:text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'users' && (
            <div>
              {/* User Management Table */}
              {isSuperAdmin && (
                <div className="mb-8 bg-gradient-to-r from-blue-50 to-teal-50 p-6 rounded-xl border border-teal-100">
                  <h2 className="text-xl font-semibold text-teal-700 mb-4">Add New Admin</h2>
                  <form onSubmit={addNewAdmin} className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="email"
                      placeholder="User's Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-grow px-4 py-2 rounded-lg border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <button 
                      type="submit" 
                      className="whitespace-nowrap bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-6 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      Grant Admin Access
                    </button>
                  </form>
                </div>
              )}
              
              {users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users
                        .filter(user => 
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((user) => (
                        <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium mr-3">
                                {user.email ? user.email.charAt(0).toUpperCase() : '?'}
                              </div>
                              <span className="text-sm font-medium text-gray-900">{user.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col space-y-1">
                              {user.isSuperAdmin && (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                  Super Admin
                                </span>
                              )}
                              {user.isAdmin && !user.isSuperAdmin && (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                  Admin
                                </span>
                              )}
                              {!user.isAdmin && !user.isSuperAdmin && (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                  Regular User
                                </span>
                              )}
                              {user.permissions?.suspended && (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                  Suspended
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {user.permissions?.canRead !== false && (
                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">Read</span>
                              )}
                              {user.permissions?.canPost !== false && (
                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Post</span>
                              )}
                              {user.permissions?.canEdit !== false && (
                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">Edit</span>
                              )}
                              {user.permissions?.canDelete !== false && (
                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800">Delete</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-col md:flex-row gap-2">
                              {/* Super admin actions - Only visible for super admins */}
                              {isSuperAdmin && (
                                <>
                                  <button
                                    onClick={() => handleToggleAdminStatus(user.uid, user.isAdmin)}
                                    className={`py-1 px-3 rounded-lg text-xs transition-colors ${
                                      user.isAdmin 
                                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                    }`}
                                    disabled={user.uid === currentUser?.uid}
                                  >
                                    {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                  </button>
                                  
                                  <button
                                    onClick={() => handleToggleSuperAdmin(user.uid, user.isSuperAdmin)}
                                    className={`py-1 px-3 rounded-lg text-xs transition-colors ${
                                      user.isSuperAdmin 
                                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                    }`}
                                    disabled={user.uid === currentUser?.uid}
                                  >
                                    {user.isSuperAdmin ? 'Remove Super Admin' : 'Make Super Admin'}
                                  </button>
                                </>
                              )}
                              
                              {/* Permission button - For both admins and super admins */}
                              {(isAdmin || isSuperAdmin) && (
                                <button 
                                  onClick={() => handleEditPermissions(user)}
                                  className="py-1 px-3 rounded-lg text-xs bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                                >
                                  Edit Permissions
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-indigo-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="text-lg text-gray-600">No users found in the system.</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'permissions' && (
            <div>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 mb-6">
                <h2 className="text-xl font-semibold text-indigo-700 mb-4">User Permissions Guide</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-medium text-indigo-700 mb-2">Permission Types</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <span className="w-16 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 mr-2">Read</span>
                        <span>Access to view blog posts</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-16 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 mr-2">Post</span>
                        <span>Ability to create new blog posts</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-16 px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 mr-2">Edit</span>
                        <span>Ability to edit their own posts</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-16 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800 mr-2">Delete</span>
                        <span>Ability to delete their own posts</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-medium text-indigo-700 mb-2">User Roles</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800 mr-2">Super Admin</span>
                        <span>Full access, can manage admins and all content</span>
                      </li>
                      <li className="flex items-center">
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 mr-2">Admin</span>
                        <span>Can manage users and their permissions</span>
                      </li>
                      <li className="flex items-center">
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800 mr-2">Regular User</span>
                        <span>Limited to their permission settings</span>
                      </li>
                      <li className="flex items-center">
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800 mr-2">Suspended</span>
                        <span>Restricted from writing operations</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <p className="text-center text-gray-600">
                To edit a user's permissions, go to the "Manage Users" tab and click "Edit Permissions" for the specific user.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Permissions Modal */}
      {showPermissionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-blue-700 mb-4">
              Edit Permissions for {editingUser?.email}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={permissions.canRead !== false}
                    onChange={() => setPermissions(prev => ({...prev, canRead: !prev.canRead}))}
                    className="rounded text-blue-500 focus:ring-blue-500 mr-2"
                  />
                  <span>Can Read</span>
                </label>
                <span className="text-xs text-gray-500">Access to view blog posts</span>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={permissions.canPost !== false}
                    onChange={() => setPermissions(prev => ({...prev, canPost: !prev.canPost}))}
                    className="rounded text-blue-500 focus:ring-blue-500 mr-2"
                  />
                  <span>Can Post</span>
                </label>
                <span className="text-xs text-gray-500">Create new blog posts</span>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={permissions.canEdit !== false}
                    onChange={() => setPermissions(prev => ({...prev, canEdit: !prev.canEdit}))}
                    className="rounded text-blue-500 focus:ring-blue-500 mr-2"
                  />
                  <span>Can Edit</span>
                </label>
                <span className="text-xs text-gray-500">Edit their own posts</span>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={permissions.canDelete !== false}
                    onChange={() => setPermissions(prev => ({...prev, canDelete: !prev.canDelete}))}
                    className="rounded text-blue-500 focus:ring-blue-500 mr-2"
                  />
                  <span>Can Delete</span>
                </label>
                <span className="text-xs text-gray-500">Delete their own posts</span>
              </div>
            
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={permissions.suspended === true}
                    onChange={() => setPermissions(prev => ({...prev, suspended: !prev.suspended}))}
                    className="rounded text-red-500 focus:ring-red-500 mr-2"
                  />
                  <span className="text-red-700 font-medium">Suspend User</span>
                </label>
                <span className="text-xs text-gray-500">Restrict all write access</span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePermissions}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:from-blue-700 hover:to-teal-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {error && (
        <div className="fixed bottom-5 right-5 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg animate-bounce">
          {error}
        </div>
      )}
      
      {message && (
        <div className="fixed bottom-5 right-5 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg animate-bounce">
          {message}
        </div>
      )}

      {/* Login Logs Section */}
      {renderLoginLogs()}
    </div>
  );
};

export default AdminPanel; 