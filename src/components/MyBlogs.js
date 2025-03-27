import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import './MyBlogs.css';

const MyBlogs = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, deletePost, loading: authLoading } = useAuth();
  const navigate = useNavigate();

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

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(postId);
        // Update the local state to remove the deleted post
        setPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  if (authLoading || loading) {
    return <div className="loading">Loading your blogs...</div>;
  }

  return (
    <div className="my-blogs-container">
      <h1 className="page-title">My Blogs</h1>
      
      {posts.length === 0 ? (
        <div className="no-posts">
          <p>You haven't created any blog posts yet.</p>
          <button onClick={() => navigate('/create')} className="create-blog-btn">
            Create Your First Blog
          </button>
        </div>
      ) : (
        <div className="blog-grid">
          {posts.map(post => (
            <div key={post.id} className="blog-card">
              <h2 className="blog-title">{post.title}</h2>
              <div className="blog-date">
                {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown date'}
              </div>
              <p className="blog-excerpt">{getContentPreview(post.content)}</p>
              <div className="blog-actions">
                <button 
                  onClick={() => handleEdit(post.id)} 
                  className="edit-btn"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(post.id)} 
                  className="delete-btn"
                >
                  Delete
                </button>
                <button 
                  onClick={() => navigate(`/post/${post.id}`)} 
                  className="view-btn"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBlogs; 