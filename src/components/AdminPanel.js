import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import './AdminPanel.css';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect non-admin users away from this page
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    fetchUsers();
  }, [currentUser, isAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isAdmin: !currentStatus
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.uid === userId 
          ? { ...user, isAdmin: !currentStatus } 
          : user
      ));
      
      setMessage(`User admin status updated successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error updating admin status:', err);
      setError('Failed to update admin status. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const addNewAdmin = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter an email address.');
      return;
    }
    
    try {
      // First, find the user in the database
      const usersRef = collection(db, 'users');
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);
      
      let userFound = false;
      
      for (const docSnapshot of querySnapshot.docs) {
        if (docSnapshot.data().email === email) {
          // User found, update their admin status
          await updateDoc(doc(db, 'users', docSnapshot.id), {
            isAdmin: true
          });
          
          setMessage(`User ${email} has been granted admin privileges.`);
          userFound = true;
          
          // Refresh user list
          fetchUsers();
          break;
        }
      }
      
      if (!userFound) {
        setError(`User with email ${email} not found. They need to register first.`);
      }
      
      // Clear the form
      setEmail('');
    } catch (err) {
      console.error('Error adding new admin:', err);
      setError('Failed to add new admin. Please try again.');
    }
    
    // Clear messages after a delay
    setTimeout(() => {
      setMessage('');
      setError('');
    }, 3000);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      
      <div className="admin-section">
        <h3>Add New Admin</h3>
        <form onSubmit={addNewAdmin}>
          <div className="form-group">
            <input
              type="email"
              placeholder="User's Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit">Grant Admin Access</button>
          </div>
        </form>
      </div>
      
      <div className="admin-section">
        <h3>Manage Users</h3>
        {users.length > 0 ? (
          <table className="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Admin Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.uid}>
                  <td>{user.email}</td>
                  <td>{user.isAdmin ? 'Admin' : 'Regular User'}</td>
                  <td>
                    <button 
                      onClick={() => toggleAdminStatus(user.uid, user.isAdmin)}
                      className={user.isAdmin ? 'remove-admin-btn' : 'make-admin-btn'}
                    >
                      {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No users found.</p>
        )}
      </div>
      
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default AdminPanel; 