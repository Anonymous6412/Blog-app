import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { createPost, currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if auth has finished loading and user is not logged in
    if (!authLoading && !currentUser) {
      navigate('/login'); // Redirect to login if not authenticated
    }
  }, [currentUser, navigate, authLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPost({ title, content, author: currentUser.email }); // Store the current user's email as author
      navigate('/'); // Navigate back to homepage after post is created
    } catch (error) {
      console.log('Error creating post:', error.message);
    }
  };

  // Show a loading state or return null when auth is still loading
  if (authLoading) return <p>Loading...</p>;

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h2 className="text-center my-4">Create a New Post</h2>
          <form onSubmit={handleSubmit} className="shadow p-4 rounded">
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                id="title"
                placeholder="Enter post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="content" className="form-label">Content</label>
              <textarea
                className="form-control"
                id="content"
                rows="5"
                placeholder="Enter post content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Create Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
