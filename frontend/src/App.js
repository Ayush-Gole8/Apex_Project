import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackendStatusChecker from './components/BackendStatusChecker';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import GeneratedCourse from './components/GeneratedCourse';
import PreviousCourses from './components/PreviousCourses';
import CodePlaygroundPage from './components/CodePlaygroundPage';
import LoginPage from './components/LoginPage';
import SkillAssessment from './components/SkillAssessment';
import LearningPath from './components/LearningPath';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
            <Navbar />
            <BackendStatusChecker>
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/course/:courseId" element={<GeneratedCourse />} />
                  <Route path="/courses" element={<PreviousCourses />} />
                  <Route path="/playground" element={<CodePlaygroundPage />} />
                  <Route path="/assessment" element={<SkillAssessment />} />
                  <Route path="/learning-path" element={<LearningPath />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </BackendStatusChecker>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;