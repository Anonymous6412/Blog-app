import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import BlogPost from './BlogPost';

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'posts'));
      const postsData = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      console.log("Fetched posts:", postsData);
      setPosts(postsData);
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

  // Filter posts by search term
  const filteredPosts = posts.filter(post => {
    return post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           post.author?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Sort posts by date
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    console.log("Sorting posts, current sortBy:", sortBy);
    
    // Convert timestamps to comparable values
    const getTimestamp = (post) => {
      if (!post.createdAt) return 0;
      
      // Handle Firebase Timestamp object
      if (post.createdAt.toDate) {
        return post.createdAt.toDate().getTime();
      }
      
      // Handle string ISO date
      if (typeof post.createdAt === 'string') {
        return new Date(post.createdAt).getTime();
      }
      
      // Handle numeric timestamp
      if (typeof post.createdAt === 'number') {
        return post.createdAt;
      }
      
      return 0;
    };
    
    const timestampA = getTimestamp(a);
    const timestampB = getTimestamp(b);
    
    if (sortBy === 'newest') {
      return timestampB - timestampA;
    } else {
      return timestampA - timestampB;
    }
  });

  // Toggle dropdown
  const toggleDropdown = (e) => {
    e.stopPropagation();
    console.log("Toggling dropdown, current state:", isDropdownOpen);
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle sort selection
  const handleSortSelection = (value) => {
    console.log("Setting sort value to:", value);
    setSortBy(value);
    setIsDropdownOpen(false);
  };

  // Loading state
  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-sky-50 flex justify-center items-center px-4">
        <div className="text-lg text-blue-600 animate-pulse flex flex-col items-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-medium text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
            Fetching inspirational blogs...
          </p>
        </div>
      </div>
    );
  }
  
  // No posts state
  if (posts.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-sky-50 flex justify-center items-center p-4">
        <div className="text-center max-w-xl p-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center text-white">
            <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 mb-4">Start Your Blogging Journey</h2>
          <p className="text-xl text-gray-600 mb-8">No blog posts found. Be the first to share your thoughts with the world!</p>
          <button 
            onClick={() => window.location.href = '/create'} 
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1"
          >
            Create Your First Blog
          </button>
        </div>
      </div>
    );
  }

  // No search results state
  if (filteredPosts.length === 0 && searchTerm !== '') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-sky-50 px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
              Latest Blog Posts
            </h1>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-full border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full shadow-sm"
                />
                <svg className="w-5 h-5 text-blue-400 absolute left-3 top-2.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              
              {/* Custom sort dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center justify-between w-full py-2 px-4 rounded-full border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                    </svg>
                    <span>{sortBy === 'newest' ? 'Newest First' : 'Oldest First'}</span>
                  </div>
                  <svg className={`w-4 h-4 ml-2 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-full bg-white rounded-xl shadow-lg z-[100] border border-blue-100 overflow-hidden">
                    <div className="py-1">
                      <button
                        onClick={() => handleSortSelection('newest')}
                        className={`block w-full text-left px-4 py-2 text-sm ${sortBy === 'newest' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-blue-50'}`}
                      >
                        Newest First
                      </button>
                      <button
                        onClick={() => handleSortSelection('oldest')}
                        className={`block w-full text-left px-4 py-2 text-sm ${sortBy === 'oldest' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-blue-50'}`}
                      >
                        Oldest First
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-center p-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
              <svg className="w-10 h-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">No matching results</h2>
            <p className="text-gray-500 text-lg mb-5">We couldn't find any blogs matching "{searchTerm}"</p>
            <button 
              onClick={() => setSearchTerm('')} 
              className="px-6 py-2.5 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors shadow-sm"
            >
              Clear Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main view with posts
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-sky-50 px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
              Latest Blog Posts
            </h1>
            <div className="h-1.5 w-40 bg-gradient-to-r from-blue-600 to-teal-500 rounded-full mt-3"></div>
            <p className="mt-4 text-gray-600 text-lg">
              Discover inspiring thoughts and ideas from our community
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full shadow-sm"
              />
              <svg className="w-5 h-5 text-blue-400 absolute left-3 top-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            
            {/* Custom sort dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center justify-between w-full py-2.5 px-4 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                  </svg>
                  <span>{sortBy === 'newest' ? 'Newest First' : 'Oldest First'}</span>
                </div>
                <svg className={`w-4 h-4 ml-2 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-full bg-white rounded-xl shadow-lg z-[100] border border-blue-100 overflow-hidden">
                  <div className="py-1">
                    <button
                      onClick={() => handleSortSelection('newest')}
                      className={`block w-full text-left px-4 py-2 text-sm ${sortBy === 'newest' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-blue-50'}`}
                    >
                      Newest First
                    </button>
                    <button
                      onClick={() => handleSortSelection('oldest')}
                      className={`block w-full text-left px-4 py-2 text-sm ${sortBy === 'oldest' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-blue-50'}`}
                    >
                      Oldest First
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedPosts.map((post) => (
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
        
        {filteredPosts.length > 0 && (
          <div className="text-center mt-12 mb-4 py-3 px-6 bg-white/60 backdrop-blur-sm rounded-full shadow-sm inline-block mx-auto">
            <span className="text-blue-700 font-medium">
              Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'blog' : 'blogs'}
              {searchTerm && <span> matching "{searchTerm}"</span>}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;
