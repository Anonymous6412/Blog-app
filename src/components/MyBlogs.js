import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const MyBlogs = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, deletePost, loading: authLoading, userPermissions } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Process the content for preview
  const getContentPreview = (text) => {
    // Remove excessive line breaks
    const cleanedText = text.replace(/\n{3,}/g, '\n\n');
    // Get first 150 characters
    const truncated = cleanedText.substring(0, 150);
    // Add ellipsis if truncated
    return truncated + (text.length > 150 ? '...' : '');
  };

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !currentUser) {
      navigate('/login');
      return;
    }

    const fetchUserPosts = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        // Query posts by the current user's email
        const q = query(collection(db, 'posts'), where('author', '==', currentUser.email));
        const querySnapshot = await getDocs(q);
        
        const userPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort posts by date (newest first)
        userPosts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        setPosts(userPosts);
      } catch (error) {
        console.error('Error fetching user posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [currentUser, authLoading, navigate]);

  const handleEdit = (postId) => {
    navigate(`/edit/${postId}`);
  };

  const handleDeleteClick = async (postId) => {
    if (userPermissions.suspended) {
      setError("Your account is suspended. You cannot delete posts.");
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    // Confirm before deleting
    const confirmDelete = window.confirm('Are you sure you want to delete this post? This action cannot be undone.');
    if (!confirmDelete) return;
    
    try {
      setIsDeleting(true);
      await deletePost(postId, true); // Use soft delete so post goes to deleted_posts collection
      // Remove the deleted post from the posts array
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      setMessage('Post deleted successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting post:', err);
      setError(err.message || 'Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 flex justify-center items-center">
        <div className="text-lg text-indigo-600 animate-pulse flex flex-col items-center">
          <svg className="w-16 h-16 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="font-medium">Loading your blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              My Blogs
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full mt-2"></div>
          </div>
          <button 
            onClick={() => navigate('/create')} 
            className="mt-4 md:mt-0 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Create New Blog
          </button>
        </div>
        
        {userPermissions?.suspended && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Account Suspended</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Your account has been suspended and you cannot edit or delete posts. Please <a href="/support" className="font-medium underline">contact support</a> for more information or to appeal this decision.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {message && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{message}</p>
              </div>
            </div>
          </div>
        )}
        
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
        
        {posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-10 text-center">
            <svg className="w-20 h-20 mx-auto mb-6 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            <h2 className="text-2xl font-bold text-gray-700 mb-3">You haven't created any blogs yet</h2>
            <p className="text-gray-500 mb-6">Share your thoughts and ideas with the world by creating your first blog post.</p>
            <button 
              onClick={() => navigate('/create')} 
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              Start Writing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-indigo-100 flex flex-col">
                <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <div className="p-6 flex-grow">
                  <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{post.title}</h2>
                  <div className="text-xs text-gray-500 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-indigo-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                    </svg>
                    <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 border-l-4 border-indigo-100 pl-3 italic line-clamp-3">
                    {getContentPreview(post.content)}
                  </p>
                </div>
                <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 flex justify-between">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit(post.id)} 
                      className="px-3 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-full text-xs font-medium transition flex items-center"
                    >
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(post.id)} 
                      className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-full text-xs font-medium transition flex items-center"
                    >
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                      Delete
                    </button>
                  </div>
                  <button 
                    onClick={() => navigate(`/post/${post.id}`)} 
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-full text-xs font-medium transition flex items-center"
                  >
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {posts.length > 0 && (
          <div className="mt-8 text-center text-gray-500">
            {posts.length} {posts.length === 1 ? 'blog' : 'blogs'} found
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBlogs; 