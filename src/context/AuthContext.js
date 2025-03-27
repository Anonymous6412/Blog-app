import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, deleteDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

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
  const registerUserWithEmailAndPassword = async (email, password, name, mobile) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setCurrentUser(userCredential.user);
      
      // Create user document in Firestore with additional data
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await updateDoc(userDocRef, {
        email: email,
        name: name || '',
        mobile: mobile || '',
        isAdmin: false,
        createdAt: new Date().toISOString()
      }).catch(() => {
        // If updateDoc fails (document doesn't exist), create it
        setDoc(userDocRef, {
          email: email,
          name: name || '',
          mobile: mobile || '',
          isAdmin: false,
          createdAt: new Date().toISOString()
        });
      });
      
      return userCredential.user;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  // Login with email and password
  const loginUserWithEmailAndPassword = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setCurrentUser(userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Send password reset email
  const sendPasswordResetEmailHandler = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Firebase password reset error:", error);
      // Pass the original error with code intact
      throw error;
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
