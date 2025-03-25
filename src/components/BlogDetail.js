import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const BlogDetail = () => {
  const { id } = useParams(); // Retrieve post ID from URL
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const docRef = doc(db, 'posts', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPost(docSnap.data());
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching post details:', error);
      }
    };

    fetchPostDetails();
  }, [id]);

  if (!post) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container">
      <h2>{post.title}</h2>
      <p><strong>By:</strong> {post.author}</p>
      <p>{post.content}</p>
    </div>
  );
};

export default BlogDetail;
