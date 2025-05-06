import { User, UpdateProfileResponse } from '../types/user';

export const updateUserProfile = async (
  token: string, 
  updateData: { phone?: string | null; profileImageUrl?: string }
): Promise<User> => {
  const dataToSend = { ...updateData };
  
  if (dataToSend.phone === '') {
    dataToSend.phone = null;
  }
  
  if (Object.keys(dataToSend).length === 0) {
    throw new Error('No changes to update');
  }
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  try {
    const response = await fetch(`${backendUrl}auth/updateProfile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(dataToSend),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Profile update error details:', errorData);
      throw new Error(errorData.message || 'Failed to update profile');
    }
    
    const responseData: UpdateProfileResponse = await response.json();
    console.log('Profile update response:', responseData);
    
    return responseData.user;
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
};