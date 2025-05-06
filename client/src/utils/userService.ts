import { User, UpdateProfileResponse } from '../types/user';

export const updateUserProfile = async (
  token: string, 
  updateData: { phone?: string; profileImageUrl?: string }
): Promise<User> => {
  const filteredData: { phone?: string | null; profileImageUrl?: string } = Object.fromEntries(
    Object.entries(updateData).filter(([_, value]) => value !== undefined && value !== '')
  );

  if (updateData.phone === '') {
    filteredData.phone = null;
  }
  
  if (Object.keys(filteredData).length === 0) {
    throw new Error('No changes to update');
  }
  
  console.log('Sending update data:', filteredData);
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  try {
    const response = await fetch(`${backendUrl}auth/updateProfile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(filteredData),
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