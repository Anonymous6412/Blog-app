import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import './MyProfile.css';

const MyProfile = () => {
  const { currentUser, loading: authLoading } = useAuth();
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
          setUserData({
            name: data.name || '',
            email: data.email || currentUser.email || '',
            mobile: data.mobile || '',
            createdAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Unknown'
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
    
    // Validate mobile
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(editData.mobile)) {
      setError('Please enter a valid 10-digit mobile number.');
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
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="profile-container">
        <h2>Loading profile...</h2>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      
      {isEditing ? (
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={editData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={userData.email}
              disabled
              className="disabled-input"
            />
            <small>Email cannot be changed</small>
          </div>
          
          <div className="form-group">
            <label>Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              value={editData.mobile}
              onChange={handleInputChange}
              pattern="[0-9]{10}"
              placeholder="10-digit mobile number"
              required
            />
          </div>
          
          <div className="button-group">
            <button type="submit" className="save-btn">Save Changes</button>
            <button type="button" className="cancel-btn" onClick={handleEditToggle}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="profile-details">
          <div className="detail-item">
            <strong>Name:</strong>
            <span>{userData.name || 'Not provided'}</span>
          </div>
          
          <div className="detail-item">
            <strong>Email:</strong>
            <span>{userData.email}</span>
          </div>
          
          <div className="detail-item">
            <strong>Mobile:</strong>
            <span>{userData.mobile || 'Not provided'}</span>
          </div>
          
          <div className="detail-item">
            <strong>Account Created:</strong>
            <span>{userData.createdAt}</span>
          </div>
          
          <button className="edit-btn" onClick={handleEditToggle}>Edit Profile</button>
        </div>
      )}
    </div>
  );
};

export default MyProfile; 