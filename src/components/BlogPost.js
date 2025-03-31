import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BlogPost = ({ title, content, author, id, createdAt, onDelete, showControls = false }) => {
  const { currentUser, deletePost, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Format the date if available
  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString() : 'Unknown date';

  // Process the content for preview
  const getContentPreview = (text) => {
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
        await deletePost(id);
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
    <div className="blog-post">
      <h3>{title}</h3>
      <div className="blog-preview">
        {getContentPreview(content)}
      </div>
      <div className="post-meta">
        <p><strong>By:</strong> {author}</p>
        <p><strong>Posted on:</strong> {formattedDate}</p>
      </div>
      <Link to={`/post/${id}`} className="read-more">
        Read More
      </Link>
      {canEditDelete && showControls && (
        <div className="post-actions">
          <button onClick={handleEdit} className="edit-btn">Edit</button>
          <button onClick={handleDelete} className="delete-btn">Delete</button>
        </div>
      )}
    </div>
  );
};

export default BlogPost;
