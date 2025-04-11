export type User = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profileImageUrl?: string;
  };
  
  export type UserState = {
    token: string;
    user: User;
  } | null;
  
  export type UpdateProfileResponse = {
    message: string;
    user: User;
  };