import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './ForgotPassword.css'; // Add custom styling if needed

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { sendPasswordResetEmailHandler } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await sendPasswordResetEmailHandler(email);
      setSuccessMessage('Password reset email has been sent. Please check your inbox.');
    } catch (error) {
      if (error.message === 'auth/user-not-found') {
        setErrorMessage('No account exists with this email address. Please check the email or sign up for a new account.');
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Send Reset Link</button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
      </form>
    </div>
  );
};

export default ForgotPassword;
