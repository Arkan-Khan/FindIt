// src/components/AuthWrapper.tsx
import React, { useEffect, useState } from 'react';
import { useRecoilValueLoadable } from 'recoil';
import { userAtom } from '../recoil/userAtom';

type Props = {
  children: React.ReactNode;
};

const AuthWrapper = ({ children }: Props) => {
  const userLoadable = useRecoilValueLoadable(userAtom);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (userLoadable.state !== 'loading') {
      setHydrated(true);
    }
  }, [userLoadable.state]);

  if (!hydrated) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default AuthWrapper;
