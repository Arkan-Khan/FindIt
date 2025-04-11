import { User, UpdateProfileResponse } from '../types/user';

export const updateUserProfile = async (
  token: string, 
  updateData: { phone?: string; profileImageUrl?: string }
): Promise<User> => {
  const response = await fetch('http://localhost:5000/auth/updateProfile', {
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