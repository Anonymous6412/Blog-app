import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'; // Import sendPasswordResetEmail
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Register user with email and password
  const registerUserWithEmailAndPassword = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setCurrentUser(userCredential.user);
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

  // Send Password Reset Email
  const sendPasswordResetEmailHandler = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw new Error('An error occurred while sending the reset email. Please try again.');
    }
  };

  // Create post function
  const createPost = async (postData) => {
    try {
      const docRef = await addDoc(collection(db, 'posts'), postData);
      console.log('Document written with ID: ', docRef.id);
    } catch (error) {
      console.error('Error adding document: ', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, registerUserWithEmailAndPassword, loginUserWithEmailAndPassword, sendPasswordResetEmailHandler, createPost }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
