import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavBar from './components/NavBar';
import BlogList from './components/BlogList';
import CreatePost from './components/CreatePost';
import AuthForm from './components/AuthForm';
import BlogDetail from './components/BlogDetail';
import ForgotPassword from './components/ForgotPassword';  // Import ForgotPassword Component

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<BlogList />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/login" element={<AuthForm isLogin={true} />} />
          <Route path="/signup" element={<AuthForm isLogin={false} />} />
          <Route path="/post/:id" element={<BlogDetail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Add ForgotPassword route */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
