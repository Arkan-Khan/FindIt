import React, { useState } from 'react';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../recoil/userAtom';

interface Props {
  onClose: () => void;
  onGroupCreated: (group: any) => void;
}

const CreateGroupModal: React.FC<Props> = ({ onClose, onGroupCreated }) => {
  const user = useRecoilValue(userAtom);
  const [groupName, setGroupName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName || !imageFile || !user?.token) return;
    setUploading(true);

    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'groupprofile');

      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );

      const imageUrl = cloudinaryRes.data.secure_url;

      const backendRes = await axios.post(
        'http://localhost:5000/groups/create',
        {
          name: groupName,
          groupImageUrl: imageUrl,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      onGroupCreated(backendRes.data.group);
      setGroupName('');
      setImageFile(null);
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Group creation failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create Group</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
              Group Name
            </label>
            <input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
          
          <div>
            <label htmlFor="groupImage" className="block text-sm font-medium text-gray-700 mb-1">
              Group Image
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {previewUrl ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  id="groupImage"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="groupImage"
                  className="inline-block px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  Choose File
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  {imageFile ? imageFile.name : "No file selected"}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row-reverse gap-3">
          <button
            onClick={handleCreateGroup}
            disabled={uploading}
            className="w-full sm:w-auto px-6 py-3 bg-black text-white rounded-md font-medium disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {uploading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </div>
            ) : (
              "Create Group"
            )}
          </button>
          <button
            onClick={onClose}
            disabled={uploading}
            className="w-full sm:w-auto px-6 py-3 bg-white text-black border-2 border-black rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;