import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
  const { currentUser, resendEmailVerification } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // If countdown is active, decrease it every second
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendVerification = async () => {
    if (!currentUser) {
      setErrorMessage('You must be logged in to resend verification email. Please log in first.');
      return;
    }

    if (currentUser.emailVerified) {
      setSuccessMessage('Your email is already verified. You can proceed to use all features.');
      return;
    }

    if (countdown > 0) {
      return; // Button is disabled, do nothing
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsResending(true);

    try {
      const result = await resendEmailVerification();
      if (result) {
        setSuccessMessage('Verification email has been sent. Please check your inbox and spam folder.');
        // Set 60-second countdown before allowing another resend
        setCountdown(60);
      } else {
        setErrorMessage('Unable to send verification email. You may already be verified or there was an error.');
      }
    } catch (error) {
      console.error("Error resending verification:", error);
      if (error.code === 'auth/too-many-requests') {
        setErrorMessage('Too many attempts. Please try again later.');
      } else {
        setErrorMessage('Failed to send verification email. Please try again later.');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-violet-600 to-fuchsia-600"></div>
      <div className="px-8 py-10">
        <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 mb-6">
          Email Verification
        </h2>
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-6">
            {currentUser ? (
              currentUser.emailVerified ? (
                "Your email is already verified. You can use all features of the application."
              ) : (
                "Your email is not yet verified. Please check your inbox for a verification link, or request a new one below."
              )
            ) : (
              "Please sign in first to verify your email."
            )}
          </p>
          
          {currentUser && !currentUser.emailVerified && (
            <div className="mb-6 text-sm text-gray-500">
              <p>A verification email was sent to: <span className="font-medium">{currentUser.email}</span></p>
            </div>
          )}
          
          {!currentUser && (
            <div className="mb-6 text-center">
              <NavLink 
                to="/login"
                className="inline-block px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Go to Login
              </NavLink>
            </div>
          )}
          
          {currentUser && !currentUser.emailVerified && (
            <button
              onClick={handleResendVerification}
              disabled={isResending || countdown > 0}
              className={`w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-medium rounded-xl transition duration-300 shadow-md hover:shadow-lg ${
                isResending || countdown > 0 ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isResending ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : countdown > 0 ? (
                `Resend in ${countdown} seconds`
              ) : (
                'Resend Verification Email'
              )}
            </button>
          )}
          
          {errorMessage && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded text-left">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          {successMessage && (
            <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded text-left">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{successMessage}</p>
                  <p className="text-xs text-green-600 mt-1">
                    Please check both your inbox and spam folder.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="text-center mt-8 text-sm">
          <NavLink to="/" className="font-medium text-violet-600 hover:text-violet-800 transition duration-200">
            Return to Home
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 