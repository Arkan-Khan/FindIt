import { useRecoilValue } from 'recoil';
import { Navigate, Outlet } from 'react-router-dom';
import { userState } from '../atoms/userAtom';

const ProtectedRoute = () => {
  const user = useRecoilValue(userState);

  if (!user) {
    return <Navigate to="/login" />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
