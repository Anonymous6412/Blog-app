import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavBar from './components/NavBar';
import BlogList from './components/BlogList';
import CreatePost from './components/CreatePost';
import AuthForm from './components/AuthForm';
import BlogDetail from './components/BlogDetail';
import EditPost from './components/EditPost';
import VerifyEmail from './components/VerifyEmail';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import SuperAdminRoute from './components/SuperAdminRoute';
import AdminPanel from './components/AdminPanel';
import AdminLogs from './components/AdminLogs';
import DeletedContent from './components/DeletedContent';
import ForgotPassword from './components/ForgotPassword';
import MyProfile from './components/MyProfile';
import MyBlogs from './components/MyBlogs';
import Footer from './components/Footer';
import Support from './components/Support';
import SupportTickets from './components/SupportTickets';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<BlogList />} />
            <Route path="/login" element={<AuthForm isLogin={true} />} />
            <Route path="/register" element={<AuthForm isLogin={false} />} />
            <Route path="/signup" element={<AuthForm isLogin={false} />} />
            <Route path="/post/:id" element={<BlogDetail />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/create" element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            } />
            <Route path="/edit/:id" element={
              <ProtectedRoute>
                <EditPost />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
            } />
            <Route path="/my-blogs" element={
              <ProtectedRoute>
                <MyBlogs />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } />
            <Route path="/admin/logs" element={
              <AdminRoute>
                <AdminLogs />
              </AdminRoute>
            } />
            <Route path="/admin/deleted-content" element={
              <SuperAdminRoute>
                <DeletedContent />
              </SuperAdminRoute>
            } />
            <Route path="/support" element={<Support />} />
            <Route path="/admin/support-tickets" element={<SupportTickets />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
