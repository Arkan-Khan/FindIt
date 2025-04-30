import { ReactNode, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userAtom } from '../recoil/userAtom';

type Props = {
  children: ReactNode;
};

const PublicRoute = ({ children }: Props) => {
  const user = useRecoilValue(userAtom);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (user && ['/login', '/signup'].includes(window.location.pathname)) {
      toast.info("You're already logged in. Please logout to continue.", {
        toastId: 'already-logged-in',
      });
      const timer = setTimeout(() => {
        setShouldRedirect(true);
      }, 20);

      return () => clearTimeout(timer);
    }
  }, [user]);
  if (shouldRedirect) {
    return <Navigate to="/groups" replace />;
  }
  if (user) {
    return null;
  }
  return children;
};
export default PublicRoute;
