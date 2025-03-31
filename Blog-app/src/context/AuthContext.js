import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut
} from 'firebase/auth';
import { auth, db } from '../firebase/firebaseConfig';
import { collection, addDoc, deleteDoc, doc, updateDoc, getDoc, setDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

const AuthContext = createContext();

// Inactivity timeout in milliseconds (20 minutes)
const INACTIVITY_TIMEOUT = 20 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userPermissions, setUserPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [inactivityTimer, setInactivityTimer] = useState(null);

  // Handle auto logout on inactivity
  const resetInactivityTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    
    // Set new timer if user is logged in
    if (currentUser) {
      const timer = setTimeout(() => {
        console.log("Logging out due to inactivity");
        signOut(auth);
      }, INACTIVITY_TIMEOUT);
      setInactivityTimer(timer);
    }
  };

  // Add event listeners for user activity
  useEffect(() => {
    if (currentUser) {
      // Reset timer when user is active
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      
      const handleUserActivity = () => {
        resetInactivityTimer();
      };
      
      events.forEach(event => {
        document.addEventListener(event, handleUserActivity);
      });
      
      // Set initial timer
      resetInactivityTimer();
      
      // Cleanup
      return () => {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        events.forEach(event => {
          document.removeEventListener(event, handleUserActivity);
        });
      };
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        console.log("User authenticated:", user.email);
        console.log("Email verified status:", user.emailVerified);
        
        try {
          // Check user status in Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData.isAdmin === true);
            setIsSuperAdmin(userData.isSuperAdmin === true);
            
            // Load user permissions
            setUserPermissions({
              canRead: userData.permissions?.canRead !== false, // Default to true
              canPost: userData.permissions?.canPost !== false, // Default to true
              canEdit: userData.permissions?.canEdit !== false, // Default to true
              canDelete: userData.permissions?.canDelete !== false, // Default to true
              suspended: userData.permissions?.suspended === true // Default to false
            });
          } else {
            // Create user document if it doesn't exist
            await updateDoc(userDocRef, {
              email: user.email,
              isAdmin: false,
              isSuperAdmin: false,
              emailVerified: user.emailVerified,
              permissions: {
                canRead: true,
                canPost: true,
                canEdit: true,
                canDelete: true,
                suspended: false
              }
            }).catch(() => {
              // If updateDoc fails (document doesn't exist), create it
              setDoc(userDocRef, {
                email: user.email,
                isAdmin: false,
                isSuperAdmin: false,
                emailVerified: user.emailVerified,
                permissions: {
                  canRead: true,
                  canPost: true,
                  canEdit: true,
                  canDelete: true,
                  suspended: false
                }
              });
            });
            setIsAdmin(false);
            setIsSuperAdmin(false);
            setUserPermissions({
              canRead: true,
              canPost: true,
              canEdit: true,
              canDelete: true,
              suspended: false
            });
          }
        } catch (error) {
          console.error("Error checking user status:", error);
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setUserPermissions({
            canRead: true,
            canPost: true,
            canEdit: true,
            canDelete: true,
            suspended: false
          });
        }
      } else {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setUserPermissions({});
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Register user with email and password
  const registerUserWithEmailAndPassword = async (email, password, name, mobile) => {
    try {
      console.log("Starting registration for:", email);
      console.log("User details - Name:", name, "Mobile:", mobile);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setCurrentUser(userCredential.user);
      
      // Send email verification
      console.log("Sending verification email to:", email);
      await sendEmailVerification(userCredential.user, {
        url: window.location.origin + '/login',
        handleCodeInApp: false
      });
      console.log("Verification email sent successfully");
      
      // Create user document in Firestore with additional data
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      
      // Set creation timestamp
      const timestamp = serverTimestamp();
      
      // Prepare user data with guaranteed values for name and mobile
      const userData = {
        email: email,
        name: name || '', // Ensure name is stored even if empty
        mobile: mobile || '', // Ensure mobile is stored even if empty
        isAdmin: false,
        isSuperAdmin: false,
        emailVerified: false,
        createdAt: timestamp,
        lastLogin: timestamp,
        permissions: {
          canRead: true,
          canPost: true,
          canEdit: true,
          canDelete: true,
          suspended: false
        }
      };
      
      console.log("Creating user data in Firestore:", userData);
      
      // Use setDoc directly to ensure the document is created with all fields
      await setDoc(userDocRef, userData);
      
      // Verify the data was stored correctly
      const verifyDoc = await getDoc(userDocRef);
      if (verifyDoc.exists()) {
        console.log("Verified user data stored:", verifyDoc.data());
      }
      
      // Log the registration
      await addActivityLog({
        action: 'user_registration',
        details: { email: email, name: name, timestamp: new Date().toISOString() }
      });
      
      return userCredential.user;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  // Add user login log
  const addLoginLog = async (userId, email) => {
    try {
      const logsCollection = collection(db, 'login_logs');
      await addDoc(logsCollection, {
        userId,
        email,
        timestamp: serverTimestamp(),
        action: 'login',
        deviceInfo: {
          userAgent: window.navigator.userAgent,
          platform: window.navigator.platform
        }
      });
    } catch (error) {
      console.error("Error adding login log:", error);
    }
  };

  // Login with email and password
  const loginUserWithEmailAndPassword = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setCurrentUser(userCredential.user);
      
      console.log("User logged in:", email);
      console.log("Email verified status:", userCredential.user.emailVerified);
      
      // If user exists in Firestore, update emailVerified status and check for redirect
      if (userCredential.user) {
        try {
          const userDocRef = doc(db, 'users', userCredential.user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            // Update user login metadata
            await updateDoc(userDocRef, {
              emailVerified: userCredential.user.emailVerified,
              lastLogin: serverTimestamp()
            });

            // Add login log
            await addLoginLog(userCredential.user.uid, email);
          } else {
            // The user document doesn't exist in Firestore, 
            // this could happen if the user was deleted and recreated
            console.log("User document not found in Firestore. Creating new document.");
            
            // Create a new user document with default permissions
            await setDoc(userDocRef, {
              email: userCredential.user.email,
              emailVerified: userCredential.user.emailVerified,
              isAdmin: false,
              isSuperAdmin: false,
              lastLogin: serverTimestamp(),
              createdAt: serverTimestamp(),
              permissions: {
                canRead: true,
                canPost: true,
                canEdit: true,
                canDelete: true,
                suspended: false
              }
            });

            // Add login log for new user
            await addLoginLog(userCredential.user.uid, email);
          }
        } catch (error) {
          console.error("Error updating user login status:", error);
        }
      }
      
      // Reset inactivity timer
      resetInactivityTimer();
      
      return userCredential.user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Send email verification again
  const resendEmailVerification = async () => {
    try {
      if (currentUser && !currentUser.emailVerified) {
        console.log("Resending verification email to:", currentUser.email);
        await sendEmailVerification(currentUser, {
          url: window.location.origin + '/login',
          handleCodeInApp: false
        });
        console.log("Verification email resent successfully");
        return true;
      }
      console.log("Cannot send verification email - user is either not logged in or already verified");
      return false;
    } catch (error) {
      console.error("Error sending email verification:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      throw error;
    }
  };

  // Send password reset email
  const sendPasswordResetEmailHandler = async (email) => {
    try {
      console.log("Sending password reset email to:", email);
      await sendPasswordResetEmail(auth, email);
      console.log("Password reset email sent successfully");
    } catch (error) {
      console.error("Firebase password reset error:", error);
      // Pass the original error with code intact
      throw error;
    }
  };

  // Add activity logging function
  const addActivityLog = async (logData) => {
    try {
      if (!currentUser) return;
      
      // Create a new activity log
      await addDoc(collection(db, 'activity_logs'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        timestamp: serverTimestamp(),
        ...logData
      });
      
      return true;
    } catch (error) {
      console.error("Error adding activity log:", error);
      return false;
    }
  };
  
  // Fetch user IP on application load (for logging)
  useEffect(() => {
    const fetchIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        window.sessionStorage.setItem('userIP', data.ip);
      } catch (error) {
        console.error('Error fetching IP:', error);
      }
    };
    
    fetchIP();
  }, []);

  // Create post function
  const createPost = async (postData) => {
    try {
      // Check permission
      if (!userPermissions.canPost && !isAdmin && !isSuperAdmin) {
        throw new Error("You don't have permission to create posts");
      }
      
      const docRef = await addDoc(collection(db, 'posts'), postData);
      console.log('Document written with ID: ', docRef.id);
      
      // Log this action
      await addActivityLog({
        action: 'create_post',
        details: { postId: docRef.id, title: postData.title }
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding document: ', error);
      throw error;
    }
  };

  // Edit post function
  const editPost = async (postId, updatedData) => {
    try {
      // Get original post data for permission check and logging
      const postRef = doc(db, 'posts', postId);
      const postSnap = await getDoc(postRef);
      
      if (!postSnap.exists()) {
        throw new Error("Post not found");
      }
      
      const originalData = postSnap.data();
      
      // Stricter permission checks
      if (userPermissions.suspended) {
        throw new Error("Your account is suspended. You cannot edit posts.");
      }
      
      // Check if user is post owner, admin, or super admin
      if (originalData.author !== currentUser.email && !isAdmin && !isSuperAdmin) {
        throw new Error("You can only edit your own posts");
      }
      
      // Check general permission (except for admins and super admins)
      if (!userPermissions.canEdit && !isAdmin && !isSuperAdmin) {
        throw new Error("You don't have permission to edit posts");
      }
      
      await updateDoc(postRef, updatedData);
      
      // Log this action
      await addActivityLog({
        action: 'edit_post',
        details: { postId, title: updatedData.title || originalData.title, changes: JSON.stringify({
          before: {
            title: originalData.title,
            content: originalData.content?.substring(0, 100) + '...'
          },
          after: {
            title: updatedData.title || originalData.title,
            content: (updatedData.content || originalData.content)?.substring(0, 100) + '...'
          }
        }) }
      });
    } catch (error) {
      console.error('Error updating document: ', error);
      throw error;
    }
  };

  // Delete post function with soft delete option
  const deletePost = async (postId, softDelete = false) => {
    try {
      // Get post data for permission check and archiving
      const postRef = doc(db, 'posts', postId);
      const postSnap = await getDoc(postRef);
      
      if (!postSnap.exists()) {
        throw new Error("Post not found");
      }
      
      const postData = postSnap.data();
      
      // Stricter permission checks
      if (userPermissions.suspended) {
        throw new Error("Your account is suspended. You cannot delete posts.");
      }
      
      // Check if user is post owner, admin, or super admin
      if (postData.author !== currentUser.email && !isAdmin && !isSuperAdmin) {
        throw new Error("You can only delete your own posts");
      }
      
      // Check general permission (except for admins and super admins)
      if (!userPermissions.canDelete && !isAdmin && !isSuperAdmin) {
        throw new Error("You don't have permission to delete posts");
      }
      
      if (softDelete) {
        // Move to deleted_posts collection instead of permanently deleting
        await addDoc(collection(db, 'deleted_posts'), {
          ...postData,
          originalId: postId,
          deletedBy: currentUser.uid,
          deletedByEmail: currentUser.email,
          deletedAt: serverTimestamp()
        });
      }
      
      // Delete from main collection
      await deleteDoc(postRef);
      
      // Log this action
      await addActivityLog({
        action: 'delete_post',
        details: { postId, title: postData.title, author: postData.author, softDelete: softDelete }
      });
    } catch (error) {
      console.error('Error deleting document: ', error);
      throw error;
    }
  };

  // Restore deleted post function
  const restorePost = async (postId) => {
    try {
      if (!currentUser || !isSuperAdmin) {
        throw new Error('Unauthorized access');
      }
      
      // Get the deleted post data
      const deletedPostRef = doc(db, 'deleted_posts', postId);
      const deletedPostSnap = await getDoc(deletedPostRef);
      
      if (!deletedPostSnap.exists()) {
        throw new Error('Deleted post not found');
      }
      
      const postData = deletedPostSnap.data();
      
      // Restore to posts collection
      const postRef = doc(db, 'posts', postId);
      await setDoc(postRef, postData);
      
      // Delete from deleted_posts collection
      await deleteDoc(deletedPostRef);
      
      // Log the action
      await addActivityLog({
        action: 'restore_post',
        details: { postId, title: postData.title }
      });
      
      return true;
    } catch (error) {
      console.error("Error restoring post:", error);
      throw error;
    }
  };

  // Update user permissions with change tracking
  const updateUserPermissions = async (userId, permissions) => {
    try {
      if (!isAdmin && !isSuperAdmin) {
        throw new Error("Only admins can update user permissions");
      }
      
      // Get current permissions for logging changes
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      const currentPermissions = userDoc.exists() ? (userDoc.data().permissions || {}) : {};
      
      await updateDoc(userDocRef, {
        permissions: permissions
      });
      
      // Log the changes
      await addActivityLog({
        action: 'update_permissions',
        details: { targetUserId: userId, targetUserEmail: userDoc.data()?.email || 'unknown', changes: JSON.stringify({ before: currentPermissions, after: permissions }) }
      });
      
      return true;
    } catch (error) {
      console.error('Error updating user permissions:', error);
      throw error;
    }
  };

  // Toggle user admin status with proper logging
  const toggleAdminStatus = async (userId, currentStatus) => {
    try {
      // Only super admins can change admin status
      if (!isSuperAdmin) {
        throw new Error("Only super admins can change admin status");
      }
      
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error("User not found");
      }
      
      const userData = userDoc.data();
      
      // Prevent modifying another super admin's status
      if (userData.isSuperAdmin && userId !== currentUser.uid) {
        throw new Error("Cannot modify another super admin's status");
      }
      
      const newStatus = !currentStatus;
      
      await updateDoc(userDocRef, {
        isAdmin: newStatus
      });
      
      // Log the change
      await addActivityLog({
        action: 'toggle_admin_status',
        details: { targetUserId: userId, targetUserEmail: userData.email || 'unknown', before: currentStatus, after: newStatus }
      });
      
      return true;
    } catch (error) {
      console.error('Error updating admin status:', error);
      throw error;
    }
  };

  // Set super admin status directly (with master password option)
  const setSuperAdminStatus = async (userId, newStatus, masterPassword) => {
    try {
      // Authorization check - either current user must be super admin or master password must be correct
      const MASTER_PASSWORD = process.env.REACT_APP_SUPER_ADMIN_PASSWORD || "master_password_123"; // Should be in environment variables
      
      if (!isSuperAdmin && masterPassword !== MASTER_PASSWORD) {
        throw new Error("Not authorized to set super admin status");
      }
      
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error("User not found");
      }
      
      const userData = userDoc.data();
      
      // Prevent modifying another super admin's status unless you're a super admin yourself
      if (userData.isSuperAdmin && userId !== currentUser.uid && !isSuperAdmin) {
        throw new Error("Cannot modify another super admin's status");
      }
      
      // Set both super admin and admin status
      await updateDoc(userDocRef, {
        isSuperAdmin: newStatus,
        isAdmin: newStatus ? true : userData.isAdmin // Super admins must also be admins
      });
      
      // Log the change
      await addActivityLog({
        action: 'set_super_admin_status',
        details: { targetUserId: userId, targetUserEmail: userData.email || 'unknown', before: userData.isSuperAdmin || false, after: newStatus, method: isSuperAdmin ? 'by_super_admin' : 'by_master_password' }
      });
      
      // If setting self, update local state
      if (userId === currentUser?.uid) {
        setIsSuperAdmin(newStatus);
        if (newStatus) setIsAdmin(true);
      }
      
      return true;
    } catch (error) {
      console.error('Error setting super admin status:', error);
      throw error;
    }
  };

  // Delete user (soft delete with option to restore)
  const deleteUser = async (userId, softDelete = true) => {
    try {
      // Only super admins can delete users
      if (!isSuperAdmin) {
        throw new Error("Only super admins can delete users");
      }
      
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error("User not found");
      }
      
      const userData = userDoc.data();
      
      if (softDelete) {
        // Move to deleted_users collection
        await addDoc(collection(db, 'deleted_users'), {
          ...userData,
          originalId: userId,
          deletedBy: currentUser.uid,
          deletedByEmail: currentUser.email,
          deletedAt: serverTimestamp()
        });
      }
      
      // Remove from users collection
      await deleteDoc(userDocRef);
      
      // Log the deletion
      await addActivityLog({
        action: 'delete_user',
        details: { targetUserId: userId, targetUserEmail: userData.email || 'unknown', softDelete: softDelete }
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  // Restore deleted user
  const restoreUser = async (userId) => {
    try {
      if (!currentUser || !isSuperAdmin) {
        throw new Error('Unauthorized access');
      }
      
      // Get the deleted user data
      const deletedUserRef = doc(db, 'deleted_users', userId);
      const deletedUserSnap = await getDoc(deletedUserRef);
      
      if (!deletedUserSnap.exists()) {
        throw new Error('Deleted user not found');
      }
      
      const userData = deletedUserSnap.data();
      
      // Make sure we have the original ID
      if (!userData.originalId) {
        throw new Error('Original user ID is missing. Cannot restore user.');
      }
      
      // Check if a user with this email already exists in the users collection
      const usersRef = collection(db, 'users');
      const emailQuery = query(usersRef, where('email', '==', userData.email));
      const existingUsers = await getDocs(emailQuery);
      
      if (!existingUsers.empty) {
        throw new Error(`A user with email ${userData.email} already exists. Cannot restore this user.`);
      }
      
      // Prepare the user data for restoration
      const { deletedBy, deletedByEmail, deletedAt, deletionReason, originalId, ...cleanUserData } = userData;
      
      // Create an explanation for the admin about the restoration process
      console.log("IMPORTANT: To complete user restoration, please inform the user that they need to use the 'Forgot Password' option to reset their password before logging in. The user's account in Firebase Auth might need to be recreated by the user.");
      
      // Restore the user document to the users collection with the original ID
      const userRef = doc(db, 'users', userData.originalId);
      
      await setDoc(userRef, {
        ...cleanUserData,
        name: userData.name || '',  // Ensure name is never null or undefined
        mobile: userData.mobile || '',  // Ensure mobile is never null or undefined
        createdAt: userData.createdAt || serverTimestamp(), // Preserve original creation date
        restoredAt: serverTimestamp(),
        restoredBy: currentUser.uid,
        emailVerified: true // Set email as verified to allow immediate login
      });
      
      // Delete from deleted_users collection only after successfully restoring
      await deleteDoc(deletedUserRef);
      
      // Log the action
      await addActivityLog({
        action: 'restore_user',
        details: { 
          userId: userData.originalId, 
          email: userData.email,
          restoredBy: currentUser.email
        }
      });
      
      return true;
    } catch (error) {
      console.error("Error restoring user:", error);
      throw error;
    }
  };

  // Get deleted users (for admins)
  const getDeletedUsers = async () => {
    try {
      if (!currentUser || !isSuperAdmin) {
        throw new Error('Unauthorized access');
      }
      
      const deletedUsersCollection = collection(db, 'deleted_users');
      const usersSnapshot = await getDocs(deletedUsersCollection);
      
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by deletedAt (newest first)
      return users.sort((a, b) => {
        if (!a.deletedAt) return 1;
        if (!b.deletedAt) return -1;
        return b.deletedAt - a.deletedAt;
      });
    } catch (error) {
      console.error("Error fetching deleted users:", error);
      throw error;
    }
  };

  // Get deleted posts (for admins)
  const getDeletedPosts = async () => {
    try {
      if (!currentUser || !isSuperAdmin) {
        throw new Error('Unauthorized access');
      }
      
      const deletedPostsCollection = collection(db, 'deleted_posts');
      const postsSnapshot = await getDocs(deletedPostsCollection);
      
      const posts = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by deletedAt (newest first)
      return posts.sort((a, b) => {
        if (!a.deletedAt) return 1;
        if (!b.deletedAt) return -1;
        return b.deletedAt - a.deletedAt;
      });
    } catch (error) {
      console.error("Error fetching deleted posts:", error);
      throw error;
    }
  };

  // Get activity logs (for admins)
  const getActivityLogs = async () => {
    try {
      if (!currentUser || (!isAdmin && !isSuperAdmin)) {
        throw new Error('Unauthorized access');
      }
      
      const logsCollection = collection(db, 'activity_logs');
      const logsSnapshot = await getDocs(logsCollection);
      
      const logs = logsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by timestamp (newest first)
      return logs.sort((a, b) => {
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        return b.timestamp - a.timestamp;
      });
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      throw error;
    }
  };

  // Get user login logs (for admins)
  const getLoginLogs = async () => {
    try {
      if (!currentUser || (!isAdmin && !isSuperAdmin)) {
        throw new Error('Unauthorized access');
      }
      
      const logsCollection = collection(db, 'login_logs');
      const logsSnapshot = await getDocs(logsCollection);
      
      const logs = logsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by timestamp (newest first)
      return logs.sort((a, b) => {
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        return b.timestamp - a.timestamp;
      });
    } catch (error) {
      console.error("Error fetching login logs:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        setInactivityTimer(null);
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Delete my account function
  const deleteMyAccount = async (password) => {
    try {
      if (!currentUser) {
        throw new Error("You must be logged in to delete your account");
      }
      
      // Reauthenticate user with password for security
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Get user data for archiving
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error("User data not found");
      }
      
      const userData = userDoc.data();
      
      // Archive user data in deleted_users collection
      await addDoc(collection(db, 'deleted_users'), {
        ...userData,
        originalId: currentUser.uid,
        deletedBy: currentUser.uid,
        deletedByEmail: currentUser.email,
        deletedAt: serverTimestamp(),
        deletionReason: 'self_deletion'
      });
      
      // Delete user document from users collection
      await deleteDoc(userDocRef);
      
      // Log the account deletion
      await addActivityLog({
        action: 'self_delete_account',
        details: { email: currentUser.email }
      });
      
      // Delete the Firebase Auth user
      await currentUser.delete();
      
      // Sign out
      await signOut(auth);
      
      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isAdmin,
      isSuperAdmin,
      userPermissions,
      loading,
      registerUserWithEmailAndPassword, 
      loginUserWithEmailAndPassword,
      logout,
      sendPasswordResetEmailHandler,
      resendEmailVerification,
      createPost,
      editPost,
      deletePost,
      restorePost,
      updateUserPermissions,
      toggleAdminStatus,
      setSuperAdminStatus,
      deleteUser,
      restoreUser,
      getActivityLogs,
      resetInactivityTimer,
      deleteMyAccount,
      getDeletedUsers,
      getDeletedPosts,
      getLoginLogs
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
