// client/src/utils/userService.ts
import { User, UpdateProfileResponse } from '../types/user';

export const updateUserProfile = async (
  token: string, 
  updateData: { phone?: string; profileImageUrl?: string }
): Promise<User> => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  // Validate phone number if provided
  if (updateData.phone !== undefined) {
    // Allow empty string (to clear phone number) or exactly 10 digits
    const phoneRegex = /^$|^\d{10}$/;
    if (!phoneRegex.test(updateData.phone)) {
      throw new Error('Phone number must be exactly 10 digits');
    }
  }
  
  try {
    const response = await fetch(`${backendUrl}auth/updateProfile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Profile update failed:', errorData);
      throw new Error(errorData.message || 'Failed to update profile');
    }

    const responseData: UpdateProfileResponse = await response.json();
    
    // Ensure we're returning the user object from the response
    if (!responseData.user) {
      throw new Error('Invalid response format: missing user data');
    }
    
    return responseData.user;
  } catch (error: any) {
    console.error('Profile update error:', error);
    throw error;
  }
};