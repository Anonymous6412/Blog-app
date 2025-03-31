import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthForm = ({ isLogin }) => {
  const { registerUserWithEmailAndPassword, loginUserWithEmailAndPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous errors
    setSuccessMessage(''); // Clear previous success messages
    setIsSubmitting(true);

    try {
      if (isLogin) {
        // Handle Login
        const user = await loginUserWithEmailAndPassword(email, password);
        
        if (!user.emailVerified) {
          setErrorMessage('Please verify your email before logging in.');
          setIsSubmitting(false);
          navigate('/verify-email');
          return;
        }
        
        // Successfully logged in and email is verified
        setIsSubmitting(false);
        // Redirect to home page
        navigate('/');
      } else {
        // Handle Sign-Up
        // Validate mobile number format
        const mobileRegex = /^\d{10}$/;
        if (!mobileRegex.test(mobile)) {
          setErrorMessage('Please enter a valid 10-digit mobile number.');
          setIsSubmitting(false);
          return;
        }
        
        await registerUserWithEmailAndPassword(email, password, name, mobile);
        setSuccessMessage(
          'Registration successful! Please check your email to verify your account before logging in.'
        );
        // Don't navigate, let the user see the verification message
        setIsSubmitting(false);
        // Clear form inputs
        setEmail('');
        setPassword('');
        setName('');
        setMobile('');
      }
    } catch (error) {
      setIsSubmitting(false);
      // Handle Errors
      console.error("Auth error:", error);
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('This email is already registered. Please use a different one.');
      } else if (error.code === 'auth/user-not-found') {
        setErrorMessage('No account found with this email. Please register.');
      } else if (error.code === 'auth/wrong-password') {
        setErrorMessage('Incorrect password. Please try again.');
      } else if (error.code === 'auth/too-many-requests') {
        setErrorMessage('Too many unsuccessful login attempts. Please try again later or reset your password.');
      } else if (error.code === 'auth/invalid-credential') {
        setErrorMessage('Invalid login credentials. If your account was recently restored, please use the "Forgot Password" link to reset your password before logging in.');
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            {isLogin ? 'Login to Your Account' : 'Create Your Account'}
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full mx-auto mt-2"></div>
        </div>
        
        {errorMessage && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{errorMessage}</p>
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
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="mobile"
                      placeholder="Enter your mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      required
                      pattern="[0-9]{10}"
                      disabled={isSubmitting}
                    />
                    <p className="mt-1 text-xs text-gray-500">Enter a 10-digit mobile number</p>
                  </div>
                </>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="yourname@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    required
                    minLength="6"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => {}}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {/* Add password visibility toggle logic here */}
                  </button>
                </div>
                {!isLogin && (
                  <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long</p>
                )}
              </div>
              
              {isLogin && (
                <div className="flex justify-end">
                  <NavLink to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition">
                    Forgot your password?
                  </NavLink>
                </div>
              )}
              
              <button
                type="submit"
                className={`w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLogin ? 'Logging in...' : 'Creating Account...'}
                  </div>
                ) : (
                  isLogin ? 'Login to Account' : 'Create Account'
                )}
              </button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <NavLink
                  to={isLogin ? "/register" : "/login"}
                  className="font-medium text-indigo-600 hover:text-indigo-800 ml-1 transition"
                >
                  {isLogin ? "Register now" : "Login"}
                </NavLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
