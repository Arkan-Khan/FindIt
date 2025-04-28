import { User, UpdateProfileResponse } from '../types/user';

export const updateUserProfile = async (
  token: string, 
  updateData: { phone?: string; profileImageUrl?: string }
): Promise<User> => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const response = await fetch(`${backendUrl}/auth/updateProfile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error('Failed to update profile');
  }

  const responseData: UpdateProfileResponse = await response.json();
  console.log('Profile update response:', responseData);
  
  return responseData.user;
};