import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, deleteDoc, doc, updateDoc, getDocs, query, where, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Check admin status in Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setIsAdmin(userDoc.data().isAdmin === true);
          } else {
            // Create user document if it doesn't exist
            await updateDoc(userDocRef, {
              email: user.email,
              isAdmin: false
            }).catch(() => {
              // If updateDoc fails (document doesn't exist), create it
              setDoc(userDocRef, {
                email: user.email,
                isAdmin: false
              });
            });
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Register user with email and password
  const registerUserWithEmailAndPassword = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setCurrentUser(userCredential.user);
      
      // Create user document in Firestore
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await updateDoc(userDocRef, {
        email: email,
        isAdmin: false
      }).catch(() => {
        // If updateDoc fails (document doesn't exist), create it
        setDoc(userDocRef, {
          email: email,
          isAdmin: false
        });
      });
      
      return userCredential.user;
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('auth/email-already-in-use');
      }
      throw new Error('An error occurred. Please try again.');
    }
  };

  // Login with email and password
  const loginUserWithEmailAndPassword = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setCurrentUser(userCredential.user);
      return userCredential.user;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('auth/user-not-found');
      }
      if (error.code === 'auth/wrong-password') {
        throw new Error('auth/wrong-password');
      }
      throw new Error('An error occurred. Please try again.');
    }
  };

  // Check if email exists before sending password reset
  const sendPasswordResetEmailHandler = async (email) => {
    try {
      // Check if the email exists
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length === 0) {
        // No account found with this email
        throw new Error('auth/user-not-found');
      }
      
      // Send password reset email if email exists
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.message === 'auth/user-not-found') {
        throw new Error('auth/user-not-found');
      }
      throw new Error('An error occurred while sending the reset email. Please try again.');
    }
  };

  // Create post function
  const createPost = async (postData) => {
    try {
      const docRef = await addDoc(collection(db, 'posts'), postData);
      console.log('Document written with ID: ', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding document: ', error);
      throw error;
    }
  };

  // Edit post function
  const editPost = async (postId, updatedData) => {
    try {
      await updateDoc(doc(db, 'posts', postId), updatedData);
    } catch (error) {
      console.error('Error updating document: ', error);
      throw error;
    }
  };

  // Delete post function
  const deletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
      console.error('Error deleting document: ', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isAdmin,
      loading,
      registerUserWithEmailAndPassword, 
      loginUserWithEmailAndPassword, 
      sendPasswordResetEmailHandler, 
      createPost,
      editPost,
      deletePost
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
