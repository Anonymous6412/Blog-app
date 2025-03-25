import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import './BlogDetail.css';

const BlogDetail = () => {
  const { id } = useParams(); // Retrieve post ID from URL
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, deletePost, isAdmin } = useAuth();
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
        await deletePost(id);
        navigate('/');
      } catch (error) {
        console.error('Error deleting post:', error);
        setError('Failed to delete post. Please try again.');
      }
    }
  };

  // Check if current user is the author or an admin
  const canEditDelete = currentUser && post && (currentUser.email === post.author || isAdmin);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!post) return <p>Post not found</p>;

  return (
    <div className="blog-detail">
      <h2>{post.title}</h2>
      <p className="author"><strong>By:</strong> {post.author}</p>
      <div className="content">
        <p>{post.content}</p>
      </div>
      
      {canEditDelete && (
        <div className="post-actions">
          <button onClick={handleEdit} className="edit-btn">Edit</button>
          <button onClick={handleDelete} className="delete-btn">Delete</button>
        </div>
      )}
      
      <button onClick={() => navigate('/')} className="back-btn">Back to Posts</button>
    </div>
  );
};

export default BlogDetail;
