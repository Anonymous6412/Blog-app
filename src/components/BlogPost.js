import React from 'react';
import { Link } from 'react-router-dom';

const BlogPost = ({ title, content, author, id }) => {
  return (
    <div className="blog-post">
      <h3>{title}</h3>
      <p>{content.substring(0, 100)}...</p> {/* Display only first 100 characters */}
      <p>By: {author}</p>
      <Link to={`/post/${id}`} className="read-more">
        Read More
      </Link>
    </div>
  );
};

export default BlogPost;
