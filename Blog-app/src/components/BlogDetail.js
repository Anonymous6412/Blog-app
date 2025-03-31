import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const BlogDetail = () => {
  const { id } = useParams(); // Retrieve post ID from URL
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, deletePost, isAdmin, isSuperAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const docRef = doc(db, 'posts', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('No such post found!');
        }
      } catch (error) {
        console.error('Error fetching post details:', error);
        setError('Error loading post. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [id]);

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(id, true);
        navigate('/');
      } catch (error) {
        console.error('Error deleting post:', error);
        setError('Failed to delete post. Please try again.');
      }
    }
  };

  // Check if current user is the author or an admin, but only if auth has loaded
  const canEditDelete = !authLoading && currentUser && post && (
    (currentUser.email === post.author || 
     (post.actualAuthor && currentUser.email === post.actualAuthor) || 
     isAdmin)
  );

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-lg text-indigo-600 animate-pulse flex flex-col items-center">
        <svg className="w-16 h-16 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading post...
      </div>
    </div>
  );
  
  if (error) return (
    <div className="max-w-2xl mx-auto my-16 px-6 py-8 bg-red-50 rounded-lg shadow-md text-center">
      <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p className="text-xl text-red-600 font-medium">{error}</p>
      <button 
        onClick={() => navigate('/')} 
        className="mt-6 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors duration-300"
      >
        Back to Home
      </button>
    </div>
  );
  
  if (!post) return (
    <div className="max-w-2xl mx-auto my-16 px-6 py-8 bg-gray-50 rounded-lg shadow-md text-center">
      <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p className="text-xl text-gray-600 font-medium">Post not found</p>
      <button 
        onClick={() => navigate('/')} 
        className="mt-6 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors duration-300"
      >
        Back to Home
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto my-12 bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="h-3 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
      <div className="px-8 py-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 leading-tight">{post.title}</h2>
        
        <div className="flex flex-wrap gap-4 mb-8 text-gray-600 border-b border-gray-100 pb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
            </svg>
            <span className="font-semibold text-gray-700">Author:</span>&nbsp;{post.author}
          </div>
          
          {/* Display actual author for Super Admins */}
          {isSuperAdmin && post.isAnonymous && post.actualAuthor && (
            <div className="flex items-center bg-amber-50 px-3 py-1 rounded-full">
              <svg className="w-5 h-5 mr-2 text-amber-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
              <span className="font-semibold text-amber-700">Actual Author:</span>&nbsp;
              <span className="text-amber-700">{post.actualAuthor}</span>
            </div>
          )}
          
          {post.createdAt && (
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
              </svg>
              <span className="font-semibold text-gray-700">Posted on:</span>&nbsp;{new Date(post.createdAt).toLocaleDateString()}
            </div>
          )}
        </div>
        
        <div className="prose prose-lg prose-indigo max-w-none mb-10">
          {post.content.split('\n').map((paragraph, index) => (
            paragraph ? 
              <p key={index} className="mb-4 text-gray-700 leading-relaxed">{paragraph}</p> 
              : 
              <br key={index} />
          ))}
        </div>
        
        <div className="border-t border-gray-100 pt-6 mt-10 flex flex-wrap gap-4">
          {canEditDelete && (
            <div className="flex gap-3 mr-auto">
              <button 
                onClick={handleEdit} 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-2 rounded-full transition duration-300 flex items-center shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Post
              </button>
              <button 
                onClick={handleDelete} 
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-5 py-2 rounded-full transition duration-300 flex items-center shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Post
              </button>
            </div>
          )}
          
          <button 
            onClick={() => navigate('/')} 
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-full transition duration-300 flex items-center shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Posts
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
