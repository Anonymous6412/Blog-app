import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

const BlogPost = ({ title, content, author, id, createdAt, onDelete, showControls = false }) => {
  const { currentUser, deletePost, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [authorName, setAuthorName] = useState(author);

  // Fetch author's name from Firestore
  useEffect(() => {
    const fetchAuthorName = async () => {
      // Skip if the author is 'Anonymous'
      if (author === 'Anonymous') {
        setAuthorName('Anonymous');
        return;
      }

      try {
        // Query users collection to find user with matching email
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', author));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          if (userData.name) {
            setAuthorName(userData.name);
          }
        }
      } catch (error) {
        console.error('Error fetching author name:', error);
      }
    };

    if (author) {
      fetchAuthorName();
    }
  }, [author]);

  // Format the date if available
  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString() : 'Unknown date';

  // Process the content for preview
  const getContentPreview = (text) => {
    if (!text) return '';
    // Remove excessive line breaks
    const cleanedText = text.replace(/\n{3,}/g, '\n\n');
    // Get first 150 characters
    const truncated = cleanedText.substring(0, 150);
    // Add ellipsis if truncated
    return truncated + (text.length > 150 ? '...' : '');
  };

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(id, true);
        // Use the onDelete callback instead of refreshing the page
        if (onDelete) {
          onDelete(id);
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  // Check if current user is the author or an admin, but only after auth has loaded
  const canEditDelete = !authLoading && currentUser && (currentUser.email === author || isAdmin);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-white/20 group">
      <div className="h-2 bg-gradient-to-r from-blue-600 to-teal-500"></div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-3 hover:text-blue-700 transition-colors duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-teal-500">{title}</h3>
        <div className="text-gray-600 mb-5 whitespace-pre-line overflow-hidden text-sm border-l-4 border-blue-200 pl-3 italic">
          {getContentPreview(content)}
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
          <p className="bg-blue-50 rounded-full px-3 py-1 flex items-center">
            <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
            </svg>
            <span className="font-medium text-gray-700">{authorName}</span>
          </p>
          <p className="bg-blue-50 rounded-full px-3 py-1 flex items-center">
            <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
            </svg>
            <span className="font-medium text-gray-700">{formattedDate}</span>
          </p>
        </div>
        <Link 
          to={`/post/${id}`} 
          className="inline-block bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white px-5 py-2 rounded-xl transition duration-300 mt-2 text-sm font-medium shadow-md hover:shadow-lg hover:shadow-blue-500/20"
        >
          Read More
        </Link>
        {canEditDelete && showControls && (
          <div className="flex gap-3 mt-5">
            <button 
              onClick={handleEdit} 
              className="bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition duration-300 flex items-center shadow-sm hover:shadow-md hover:shadow-teal-500/20"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button 
              onClick={handleDelete} 
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition duration-300 flex items-center shadow-sm hover:shadow-md hover:shadow-red-500/20"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPost;
