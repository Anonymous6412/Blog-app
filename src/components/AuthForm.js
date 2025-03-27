import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './authForm.css';

const AuthForm = ({ isLogin }) => {
  const { registerUserWithEmailAndPassword, loginUserWithEmailAndPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous errors

    try {
      if (isLogin) {
        // Handle Login
        await loginUserWithEmailAndPassword(email, password);
        navigate('/dashboard'); // Redirect to dashboard or home
      } else {
        // Handle Sign-Up
        await registerUserWithEmailAndPassword(email, password);
        navigate('/dashboard'); // Redirect to dashboard or home
      }
    } catch (error) {
      // Handle Errors
      console.error("Auth error:", error);
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('This email is already registered. Please use a different one.');
      } else if (error.code === 'auth/user-not-found') {
        setErrorMessage('No account found with this email. Please register.');
      } else if (error.code === 'auth/wrong-password') {
        setErrorMessage('Incorrect password. Please try again.');
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="auth-form">
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </form>
      <div className="switch-form">
        <p>
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <NavLink to="/signup" activeClassName="active">
                Sign Up
              </NavLink>
              <br />
              <NavLink to="/forgot-password" activeClassName="active">
                Forgot Password?
              </NavLink>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <NavLink to="/login" activeClassName="active">
                Login
              </NavLink>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
