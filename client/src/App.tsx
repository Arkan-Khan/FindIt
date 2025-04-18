// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userAtom } from './recoil/userAtom';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PublicRoute from './components/PublicRoute';

import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import AuthWrapper from './components/AuthWrapper';

const App = () => {
  const user = useRecoilValue(userAtom);

  return (
    <>
    <BrowserRouter>
      <AuthWrapper>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/groups" replace /> : <LandingPage />}
          />
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
             <SignupPage />
           </PublicRoute>
          } />
          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <GroupsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:groupId"
            element={
              <ProtectedRoute>
                <GroupDetailPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthWrapper>
    </BrowserRouter>
    <ToastContainer
  position="top-center"
  autoClose={3000}
/>
    </>
  );
};

export default App;
