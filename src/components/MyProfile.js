import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const MyProfile = () => {
  const { currentUser, loading: authLoading, updateUserProfile, deleteMyAccount, userPermissions } = useAuth();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    mobile: '',
    createdAt: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    mobile: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !currentUser) {
      navigate('/login');
      return;
    }

    // Fetch user data from Firestore
    const fetchUserData = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log("User data retrieved:", data); // Debug log
          
          // Format createdAt timestamp if it exists
          let formattedDate = 'Unknown';
          if (data.createdAt) {
            // Check if it's a Firebase timestamp
            if (data.createdAt.toDate) {
              formattedDate = new Date(data.createdAt.toDate()).toLocaleDateString();
            } else if (data.createdAt) {
              // Handle string or number timestamp
              formattedDate = new Date(data.createdAt).toLocaleDateString();
            }
          }
          
          setUserData({
            name: data.name || '',
            email: data.email || currentUser.email || '',
            mobile: data.mobile || '',
            createdAt: formattedDate
          });
          setEditData({
            name: data.name || '',
            mobile: data.mobile || ''
          });
        } else {
          setError('User profile not found.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, authLoading, navigate]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditData({
      name: userData.name,
      mobile: userData.mobile
    });
    setSuccessMessage('');
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setError('');
    setIsSaving(true);
    
    // Validate mobile
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(editData.mobile)) {
      setError('Please enter a valid 10-digit mobile number.');
      setIsSaving(false);
      return;
    }
    
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        name: editData.name,
        mobile: editData.mobile
      });
      
      // Update local state
      setUserData(prev => ({
        ...prev,
        name: editData.name,
        mobile: editData.mobile
      }));
      
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    
    if (!deletePassword) {
      setError("Please enter your password to confirm account deletion.");
      return;
    }
    
    // Confirm user really wants to delete account
    const confirm = window.confirm("Are you sure you want to delete your account? This action cannot be undone and all your data will be lost.");
    
    if (!confirm) return;
    
    try {
      setIsDeleting(true);
      setError(''); // Clear any previous errors
      await deleteMyAccount(deletePassword);
      // Navigate to home after successful deletion
      navigate('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please enter the correct password to delete your account.');
      } else {
        setError(err.message || 'Failed to delete account. Please try again.');
      }
      setIsDeleting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 flex justify-center items-center">
        <div className="text-lg text-indigo-600 animate-pulse flex flex-col items-center">
          <svg className="w-16 h-16 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-sky-50 to-teal-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">
            My Profile
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full mt-2"></div>
        </div>
        
        {/* Suspension notice */}
        {userPermissions?.suspended && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Account Suspended</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Your account has been suspended and some actions are restricted. Please <a href="/support" className="font-medium underline">contact support</a> for more information or to appeal this decision.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-24 relative">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                <div className="w-full h-full rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 flex items-center justify-center text-white text-3xl font-bold">
                  {userData.name ? userData.name.charAt(0).toUpperCase() : (userData.email ? userData.email.charAt(0).toUpperCase() : '?')}
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-16 px-8 pb-8">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {successMessage && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}
            
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Enter your full name"
                    required
                    disabled={isSaving}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={userData.email}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                    disabled
                  />
                  <p className="mt-1 text-xs text-gray-500">Email address cannot be changed</p>
                </div>
                
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={editData.mobile}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10}"
                    required
                    disabled={isSaving}
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving Changes...
                      </div>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                    <p className="text-lg font-medium text-gray-900">{userData.name || 'Not provided'}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Email Address</p>
                    <p className="text-lg font-medium text-gray-900">{userData.email}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Mobile Number</p>
                    <p className="text-lg font-medium text-gray-900">{userData.mobile || 'Not provided'}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Account Created</p>
                    <p className="text-lg font-medium text-gray-900">{userData.createdAt}</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={handleEditToggle}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Delete Account Section */}
        <div className="mt-10 bg-white rounded-xl shadow-md p-6 border border-red-100">
          <h2 className="text-xl font-semibold text-red-600 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Account
          </h2>
          
          <p className="text-gray-600 text-sm mb-4">
            Deleting your account is permanent. All your data, including blog posts and profile information, will be permanently removed.
          </p>
          
          <button
            onClick={() => setShowDeleteSection(!showDeleteSection)}
            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
          >
            {showDeleteSection ? 'Cancel' : 'Delete My Account'}
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showDeleteSection ? "M6 18L18 6M6 6l12 12" : "M9 5l7 7-7 7"} />
            </svg>
          </button>
          
          {showDeleteSection && (
            <form onSubmit={handleDelete} className="mt-4 border-t border-gray-100 pt-4">
              <div className="mb-4">
                <label htmlFor="deletePassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter your password to confirm deletion
                </label>
                <input
                  type="password"
                  id="deletePassword"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Permanently Delete My Account'
                )}
              </button>
              
              <p className="mt-2 text-sm text-red-600 text-center">
                This action cannot be undone.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile; 