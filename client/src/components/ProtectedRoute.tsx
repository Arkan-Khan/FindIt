import React from 'react';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../recoil/userAtom';
import { Navigate } from 'react-router-dom';

type Props = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: Props) => {
  const user = useRecoilValue(userAtom);

  if (!user) {
    // Redirect to access denied page instead of home
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;