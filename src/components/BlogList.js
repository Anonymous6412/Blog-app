import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import BlogPost from './BlogPost';
import './BlogList.css';

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'posts'));
      setPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle post deletion by filtering out the deleted post from state
  const handlePostDelete = (deletedPostId) => {
    setPosts(currentPosts => currentPosts.filter(post => post.id !== deletedPostId));
  };

  if (loading && posts.length === 0) {
    return <div className="loading">Loading blog posts...</div>;
  }
  
  if (posts.length === 0 && !loading) {
    return <div className="no-posts">No blog posts found. Be the first to create one!</div>;
  }

  return (
    <div className="blog-list-container">
      <h1 className="page-title">Latest Blog Posts</h1>
      <div className="blog-list">
        {posts.map((post) => (
          <BlogPost
            key={post.id}
            id={post.id}
            title={post.title}
            content={post.content}
            author={post.author}
            createdAt={post.createdAt}
            onDelete={handlePostDelete}
            showControls={false}
          />
        ))}
      </div>
    </div>
  );
};

export default BlogList;
