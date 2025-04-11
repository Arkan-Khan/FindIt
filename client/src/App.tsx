import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignUp';
import LoginPage from './pages/LoginPage';
import Groups from './pages/HomePage';

const App: React.FC = () => {
  return (   
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/signup" element={<SignupPage/>} />
        <Route path="/Groups" element={<Groups/>} />
        <Route path="/docs" element={<div>Documentation (Coming Soon)</div>} />
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
  );
};

export default App;