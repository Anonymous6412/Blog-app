import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import './EditPost.css';

const EditPost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { id } = useParams();
  const { currentUser, editPost, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't fetch post or redirect until authentication is loaded
    if (authLoading) return;
    
    const fetchPost = async () => {
      // First check if user is logged in
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      try {
        // Get post document
        const docRef = doc(db, 'posts', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const postData = docSnap.data();
          setTitle(postData.title);
          setContent(postData.content);
          
          // Check if user is authorized to edit this post
          if (currentUser.email !== postData.author && !isAdmin) {
            setError('You are not authorized to edit this post');
            navigate('/');
            return;
          }
        } else {
          setError('Post not found');
          navigate('/');
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Error loading post. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, currentUser, navigate, isAdmin, authLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !content) {
      setError('Title and content are required.');
      return;
    }
    
    try {
      await editPost(id, { title, content });
      navigate(`/post/${id}`);
    } catch (err) {
      console.error('Error updating post:', err);
      setError('Failed to update post. Please try again.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="edit-post-container">
      <h2>Edit Post</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="10"
            placeholder="Use line breaks to create paragraphs and formatting"
            required
          ></textarea>
          <small className="text-muted">
            Press Enter twice to create a new paragraph. Your formatting will be preserved when displayed.
          </small>
        </div>
        <div className="form-actions">
          <button type="submit" className="save-btn">Save Changes</button>
          <button 
            type="button" 
            onClick={() => navigate(`/post/${id}`)}
            className="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost; 