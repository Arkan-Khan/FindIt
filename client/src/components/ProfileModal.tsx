import React, { useState, useRef, useEffect } from 'react';
import { UserState } from '../types/user';
import { getUserData } from '../utils/userHelpers';
import { optimizeImage } from '../utils/imageUtils';
import { updateUserProfile } from '../utils/userService';
import { toast } from 'react-toastify';

type ProfileModalProps = {
  user: UserState;
  setUser: (user: UserState) => void;
  onClose: () => void;
};

const ProfileModal: React.FC<ProfileModalProps> = ({ user, setUser, onClose }) => {
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState('');
  const [tempProfileImage, setTempProfileImage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user) {
      const userData = getUserData(user);
      setTempPhone(userData.phone || '');
      setTempProfileImage(userData.profileImageUrl || '');
      setHasChanges(false);
    }
  }, [user]);

  const userData = getUserData(user);
  const profileImage = tempProfileImage || userData.profileImageUrl || '/assets/profilePic.jpg';

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    
    const limitedValue = value.slice(0, 10);
    
    setTempPhone(limitedValue);
    setHasChanges(true);
    
    // Show toast if user tries to enter more than 10 digits
    if (value.length > 10) {
      toast.warning('Phone number must be exactly 10 digits');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(5);
      
      const optimizedFile = await optimizeImage(file);
      setUploadProgress(20);
      
      const formData = new FormData();
      formData.append('file', optimizedFile);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '');
      formData.append('folder', 'userprofile');

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await res.json();
      if (data.secure_url) {
        const optimizedUrl = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
        setTempProfileImage(optimizedUrl);
        setHasChanges(true);
      }
    } catch (err) {
      console.error('Cloudinary upload failed:', err);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const saveChanges = async () => {
    if (!user?.token) return;

    // Validate phone number length if it's being changed
    if (tempPhone !== userData.phone && tempPhone.length > 0 && tempPhone.length < 10) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    try {
      setIsLoading(true);
      const updateData: { phone?: string; profileImageUrl?: string } = {};
      
      // Only include changed fields
      if (tempPhone !== userData.phone) {
        updateData.phone = tempPhone;
      }
      
      if (tempProfileImage !== userData.profileImageUrl && tempProfileImage !== '') {
        updateData.profileImageUrl = tempProfileImage;
      }

      if (Object.keys(updateData).length === 0) {
        setHasChanges(false);
        toast.info('No changes to save');
        return;
      }

      const updatedUser = await updateUserProfile(user.token, updateData);
      
      setUser({
        token: user.token,
        user: updatedUser
      });
      
      setHasChanges(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile. Please try again.');
      setTempPhone(userData.phone || '');
      setTempProfileImage(userData.profileImageUrl || '');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelChanges = () => {
    setTempPhone(userData.phone || '');
    setTempProfileImage(userData.profileImageUrl || '');
    setHasChanges(false);
    setIsEditingPhone(false);
    toast.info('Changes cancelled');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">My Profile</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 focus:outline-none"
            disabled={isLoading || isUploading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex justify-center mb-6 relative">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
            <img 
              src={profileImage} 
              alt="User profile" 
              className="w-full h-full object-cover"
            />
            
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white">
                <div className="w-3/4 bg-gray-300 rounded-full h-2 mb-2">
                  <div 
                    className="bg-white h-2 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span className="text-sm">{uploadProgress}%</span>
              </div>
            )}
          </div>
          
          <button
            className="absolute bottom-0 right-1/3 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center border-2 border-white shadow-md hover:bg-gray-800 transition-colors"
            title="Upload New Photo"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isLoading}
          >
            {isUploading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center">
            <span className="text-gray-600 font-medium w-20">Name:</span>
            <span className="text-gray-900">{userData.name}</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-gray-600 font-medium w-20">Email:</span>
            <span className="text-gray-900">{userData.email}</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-gray-600 font-medium w-20">Phone:</span>
            {isEditingPhone ? (
              <div className="flex flex-col w-full">
                <input
                  type="tel"
                  value={tempPhone}
                  onChange={handlePhoneChange}
                  onBlur={() => {
                    if (tempPhone.length > 0 && tempPhone.length < 10) {
                      toast.warning('Phone number must be exactly 10 digits');
                    }
                    setIsEditingPhone(false);
                  }}
                  className="border-b border-gray-300 focus:border-black outline-none px-2 py-1 flex-1"
                  autoFocus
                  placeholder="Enter 10-digit number"
                  pattern="[0-9]{10}"
                  maxLength={10}
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-xs ${tempPhone.length === 10 ? 'text-green-600' : 'text-gray-500'}`}>
                    {tempPhone.length}/10 digits
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center flex-1">
                <span className="text-gray-900">{tempPhone || 'N/A'}</span>
                <button 
                  className="ml-2 text-gray-500 hover:text-black focus:outline-none"
                  onClick={() => setIsEditingPhone(true)}
                  disabled={isLoading || isUploading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {hasChanges && (
            <>
              <button 
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50 disabled:opacity-50"
                onClick={saveChanges}
                disabled={isLoading || isUploading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : 'Save Changes'}
              </button>
              <button 
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 disabled:opacity-50"
                onClick={cancelChanges}
                disabled={isLoading || isUploading}
              >
                Cancel
              </button>
            </>
          )}
          <button 
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 disabled:opacity-50"
            onClick={onClose}
            disabled={isLoading || isUploading}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;