import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DeletedContent = () => {
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [deletedPosts, setDeletedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { 
    currentUser, 
    isSuperAdmin, 
    getDeletedUsers,
    getDeletedPosts,
    restoreUser,
    restorePost,
    permanentlyDeleteUser,
    permanentlyDeletePost,
    loading: authLoading 
  } = useAuth();
  
  const navigate = useNavigate();

  // Redirect non-super-admin users away from this page
  useEffect(() => {
    if (authLoading) return;
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (!isSuperAdmin) {
      navigate('/');
      return;
    }
    
    fetchDeletedContent();
  }, [currentUser, isSuperAdmin, navigate, authLoading, fetchDeletedContent]);

  const fetchDeletedContent = async () => {
    try {
      setLoading(true);
      
      // Fetch both types of deleted content
      const [users, posts] = await Promise.all([
        getDeletedUsers(),
        getDeletedPosts()
      ]);
      
      console.log("Fetched deleted users:", users);
      console.log("Fetched deleted posts:", posts);
      
      setDeletedUsers(users || []);
      setDeletedPosts(posts || []);
      setError('');
    } catch (err) {
      console.error('Error fetching deleted content:', err);
      setError('Failed to load deleted content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled in the filtered lists below
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const confirmAction = (item, action) => {
    setSelectedItem({ item, action });
    setShowConfirmModal(true);
  };

  const executeAction = async () => {
    if (!selectedItem) return;
    
    const { item, action } = selectedItem;
    
    try {
      setLoading(true);
      
      if (activeTab === 'users') {
        if (action === 'restore') {
          await restoreUser(item.id);
          setSuccessMessage(`User ${item.email} has been restored successfully.`);
        } else if (action === 'delete') {
          await permanentlyDeleteUser(item.id);
          setSuccessMessage(`User ${item.email} has been permanently deleted.`);
        }
      } else {
        if (action === 'restore') {
          await restorePost(item.id);
          setSuccessMessage(`Post "${item.title}" has been restored successfully.`);
        } else if (action === 'delete') {
          await permanentlyDeletePost(item.id);
          setSuccessMessage(`Post "${item.title}" has been permanently deleted.`);
        }
      }
      
      // Refresh the data
      await fetchDeletedContent();
    } catch (err) {
      console.error(`Error ${action === 'restore' ? 'restoring' : 'deleting'} ${activeTab === 'users' ? 'user' : 'post'}:`, err);
      setError(`Failed to ${action === 'restore' ? 'restore' : 'permanently delete'} ${activeTab === 'users' ? 'user' : 'post'}. Please try again.`);
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    try {
      // Handle Firestore timestamp
      if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleString();
      }
      
      // Handle string ISO dates
      if (typeof timestamp === 'string') {
        return new Date(timestamp).toLocaleString();
      }
      
      // Handle timestamps
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleString();
      }
      
      // Fallback for other formats
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      console.error("Error formatting date:", error, timestamp);
      return 'Unknown';
    }
  };

  // Filter lists based on search term
  const filteredUsers = deletedUsers.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredPosts = deletedPosts.filter(post => 
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add debug log to check if deletePost is being called with softDelete=true
  useEffect(() => {
    console.log("Deleted posts loaded:", deletedPosts);
  }, [deletedPosts]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex justify-center items-center">
        <div className="text-lg text-indigo-600 animate-pulse flex flex-col items-center">
          <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-medium text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">
            Loading deleted content...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-teal-50 px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">
            Deleted Content
          </h1>
          <div className="h-1.5 w-40 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full mt-3"></div>
          <p className="mt-4 text-gray-600">
            Manage content that has been deleted from the system
          </p>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Search and tab controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
            <form onSubmit={handleSearch} className="flex-grow">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-64">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                  <div className="flex rounded-md shadow-sm">
                    <button
                      type="button"
                      onClick={() => setActiveTab('users')}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-md ${
                        activeTab === 'users'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      } border border-gray-300`}
                    >
                      Deleted Users
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('posts')}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-md ${
                        activeTab === 'posts'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      } border border-gray-300 border-l-0`}
                    >
                      Deleted Posts
                    </button>
                  </div>
                </div>
                
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <div className="flex">
                    <input
                      type="text"
                      placeholder={activeTab === 'users' ? "Search by email or name..." : "Search by title or content..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-grow rounded-l-lg border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-teal-600 text-white rounded-r-lg hover:bg-teal-700"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </form>
            
            <button
              onClick={clearSearch}
              className="px-4 py-2 text-teal-600 border border-teal-600 rounded-lg hover:bg-teal-50"
            >
              Clear Search
            </button>
          </div>
        </div>
        
        {/* Content Tables */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
          {activeTab === 'users' ? (
            filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deleted On</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Before Deletion</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.photoURL ? (
                              <img className="h-10 w-10 rounded-full" src={user.photoURL} alt="" />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium">
                                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.displayName || 'No name'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.deletedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-1">
                            {user.isSuperAdmin && (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                Super Admin
                              </span>
                            )}
                            {user.isAdmin && !user.isSuperAdmin && (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                Admin
                              </span>
                            )}
                            {!user.isAdmin && !user.isSuperAdmin && (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                User
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => confirmAction(user, 'restore')}
                            className="text-teal-600 hover:text-teal-900 mr-4"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => confirmAction(user, 'delete')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Permanently Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-indigo-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-lg text-gray-600">No deleted users found</p>
                <p className="text-sm text-gray-500 mt-2">Deleted users will appear here for restoration or permanent deletion</p>
              </div>
            )
          ) : (
            filteredPosts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created On</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deleted On</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{post.title || 'No title'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{post.author || 'Unknown'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(post.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(post.deletedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => confirmAction(post, 'restore')}
                            className="text-teal-600 hover:text-teal-900 mr-4"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => confirmAction(post, 'delete')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Permanently Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-indigo-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg text-gray-600">No deleted posts found</p>
                <p className="text-sm text-gray-500 mt-2">Deleted posts will appear here for restoration or permanent deletion</p>
              </div>
            )
          )}
        </div>
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${
                    selectedItem?.action === 'restore' ? 'bg-blue-100' : 'bg-red-100'
                  } sm:mx-0 sm:h-10 sm:w-10`}>
                    <svg 
                      className={`h-6 w-6 ${selectedItem?.action === 'restore' ? 'text-blue-600' : 'text-red-600'}`} 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      {selectedItem?.action === 'restore' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      )}
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {selectedItem?.action === 'restore' ? 'Restore' : 'Permanently Delete'} {activeTab === 'users' ? 'User' : 'Post'}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {selectedItem?.action === 'restore' ? (
                          <>
                            Are you sure you want to restore this {activeTab === 'users' ? 'user' : 'post'}? 
                            {activeTab === 'users' ? (
                              ' The user will be moved back to the active users list and can log in again.'
                            ) : (
                              ' The post will be visible again in the blog.'
                            )}
                          </>
                        ) : (
                          <>
                            Are you sure you want to permanently delete this {activeTab === 'users' ? 'user' : 'post'}? 
                            This action cannot be undone and all data will be permanently lost.
                          </>
                        )}
                      </p>
                    </div>
                    <div className="mt-4">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm font-medium text-gray-700">
                          {activeTab === 'users' ? 'Email:' : 'Title:'}
                        </p>
                        <p className="text-sm text-gray-900 mt-1">
                          {activeTab === 'users' ? selectedItem?.item.email : selectedItem?.item.title}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={executeAction}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white ${
                    selectedItem?.action === 'restore' 
                      ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' 
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm`}
                >
                  {selectedItem?.action === 'restore' ? 'Restore' : 'Delete Permanently'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeletedContent; 