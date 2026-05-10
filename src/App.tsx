/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import StudyNotes from './pages/StudyNotes';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import AboutAuthor from './pages/AboutAuthor';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import Syllabus from './pages/Syllabus';
import VideoLectures from './pages/VideoLectures';
import QA from './pages/QA';
import FAQ from './pages/FAQ';
import Doubts from './pages/Doubts';

function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background w-full">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route 
              path="/study-notes" 
              element={
                <ProtectedRoute>
                  <StudyNotes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/lectures" 
              element={
                <ProtectedRoute>
                  <VideoLectures />
                </ProtectedRoute>
              } 
            />
            <Route path="/syllabus" element={<Syllabus />} />
            <Route 
              path="/doubts" 
              element={
                <ProtectedRoute>
                  <Doubts />
                </ProtectedRoute>
              } 
            />
            <Route path="/about" element={<AboutAuthor />} />
            <Route 
              path="/qa" 
              element={
                <ProtectedRoute>
                  <QA />
                </ProtectedRoute>
              } 
            />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/auth" element={<Auth />} />
          </Route>

          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
