import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BlogPost = ({ title, content, author, id }) => {
  const { currentUser, deletePost, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(id);
        // Force a page refresh to update the list
        window.location.reload();
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  // Check if current user is the author or an admin, but only after auth has loaded
  const canEditDelete = !authLoading && currentUser && (currentUser.email === author || isAdmin);

  return (
    <div className="blog-post">
      <h3>{title}</h3>
      <p>{content.substring(0, 100)}...</p> {/* Display only first 100 characters */}
      <p>By: {author}</p>
      <Link to={`/post/${id}`} className="read-more">
        Read More
      </Link>
      {canEditDelete && (
        <div className="post-actions">
          <button onClick={handleEdit} className="edit-btn">Edit</button>
          <button onClick={handleDelete} className="delete-btn">Delete</button>
        </div>
      )}
    </div>
  );
};

export default BlogPost;
