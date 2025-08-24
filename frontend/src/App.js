import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Landing from './components/Landing';
import GeneratedCourse from './components/GeneratedCourse';
import CourseDetail from './components/CourseDetail';
import PreviousCourses from './components/PreviousCourses';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <div className="App">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/generated-course" element={<GeneratedCourse />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/my-courses" element={<PreviousCourses />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#fff',
                backdropFilter: 'blur(10px)',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;