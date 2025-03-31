import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [maxChars] = useState(10000);
  const [charCount, setCharCount] = useState(0);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [userName, setUserName] = useState('');
  const { currentUser, createPost, userPermissions } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else {
      // Fetch user's name from Firestore
      const fetchUserName = async () => {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists() && userDoc.data().name) {
            setUserName(userDoc.data().name);
          } else {
            // Fall back to email if name is not available
            setUserName(currentUser.email);
          }
        } catch (error) {
          console.error("Error fetching user name:", error);
          setUserName(currentUser.email);
        }
      };
      
      fetchUserName();
    }
  }, [currentUser, navigate]);

  // Update character count when content changes
  useEffect(() => {
    setCharCount(content.length);
  }, [content]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      await createPost({ 
        title, 
        content, 
        author: isAnonymous ? 'Anonymous' : (userName || currentUser.email),
        authorEmail: currentUser.email, // Always store the real email for reference
        actualAuthor: currentUser.email, // For backward compatibility
        isAnonymous: isAnonymous,
        createdAt: new Date().toISOString() // Add creation date
      });
      
      setSuccess(true);
    } catch (error) {
      console.log('Error creating post:', error.message);
      setError(error.message);
      setSubmitting(false);
    }
  };

  // Show a loading state or return null when auth is still loading
  if (userPermissions?.suspended) return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 flex justify-center items-center">
      <div className="text-lg text-indigo-600 animate-pulse flex flex-col items-center">
        <svg className="w-16 h-16 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="font-medium">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Create a New Blog Post
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full mx-auto mt-2"></div>
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
                  <p>Your account has been suspended and you cannot create new posts. Please <a href="/support" className="font-medium underline">contact support</a> for more information or to appeal this decision.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {success ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Post Created Successfully!</h2>
            <p className="text-gray-600 mb-6">Your blog post has been published.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setTitle('');
                  setContent('');
                  setImage(null);
                  setPreviewUrl('');
                  setTags([]);
                  setIsAnonymous(false);
                  setSuccess(false);
                }}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-colors"
              >
                Create Another Post
              </button>
              <Link
                to="/"
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg shadow-md transition-colors"
              >
                View All Posts
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg overflow-hidden">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-8">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Blog Title</label>
                <input
                  type="text"
                  id="title"
                  placeholder="Enter an eye-catching title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  disabled={submitting || userPermissions?.suspended}
                />
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between mb-1">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">Blog Content</label>
                  <span className={`text-xs ${charCount > maxChars ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                    {charCount}/10000 characters
                  </span>
                </div>
                <textarea
                  id="content"
                  rows="15"
                  placeholder="Write your blog content here... Use line breaks to create paragraphs and structure your ideas."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  maxLength="10000"
                  disabled={submitting || userPermissions?.suspended}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Press Enter twice to create a new paragraph. Your formatting will be preserved when displayed.
                </p>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center">
                  <input
                    id="anonymous"
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={() => setIsAnonymous(!isAnonymous)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    disabled={submitting || userPermissions?.suspended}
                  />
                  <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                    Post anonymously (your name won't be visible to readers)
                  </label>
                </div>
                {isAnonymous ? (
                  <p className="mt-1 text-xs text-gray-500 italic">
                    Note: Super admins will still be able to see who authored this post for moderation purposes.
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Your post will be attributed to: <span className="font-medium">{userName || currentUser?.email}</span>
                  </p>
                )}
              </div>
              
              <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-4">
                <Link
                  to="/"
                  className="mt-4 sm:mt-0 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg shadow-sm flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Cancel
                </Link>
                <button
                  type="submit"
                  className={`flex items-center justify-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg shadow-md ${
                    submitting || userPermissions?.suspended ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  disabled={submitting || userPermissions?.suspended}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Publish Blog Post
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreatePost;
