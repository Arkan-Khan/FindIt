import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userAtom } from './recoil/userAtom';
import NotificationHandler from './components/NotificationHandler';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PublicRoute from './components/PublicRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const user = useRecoilValue(userAtom);

  return (
    <>
      <BrowserRouter>
        {user && <NotificationHandler />}
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
          <Route path="/access-denied" element={<AccessDeniedPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer
        position="top-center"
        autoClose={3000}
      />
    </>
  );
};

export default App;