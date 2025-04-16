import React, { useState } from 'react';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../recoil/userAtom';
import { X, Upload, Loader2 } from 'lucide-react';

interface PostModalProps {
  groupId: string;
  onClose: () => void;
  onPostCreated: (newPost: any) => void;
}

const PostModal: React.FC<PostModalProps> = ({ groupId, onClose, onPostCreated }) => {
  const user = useRecoilValue(userAtom);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [postType, setPostType] = useState<'LOST' | 'FOUND'>('LOST');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.token) return;
    if (!title || !details || !imageFile) {
      setError('Please provide a title, details, and image for your post');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Upload image to Cloudinary first
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'posts'); // Upload to posts folder
      
      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );
      
      const imageUrl = cloudinaryRes.data.secure_url;
      
      // Create the post with the uploaded image URL
      const postData = {
        title,
        details,
        postType,
        imageUrl,
        groupId,
      };
      
      const postRes = await axios.post(`${backendUrl}posts`, postData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      onPostCreated(postRes.data.post);
      onClose();
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Create New Post</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Image
            </label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              {imagePreview ? (
                <div className="relative w-full h-40">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload an image</p>
                </>
              )}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>
          
          {/* Item Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Post Type
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="type"
                  value="LOST"
                  checked={postType === 'LOST'}
                  onChange={() => setPostType('LOST')}
                />
                <span className="ml-2">Lost Item</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="type"
                  value="FOUND"
                  checked={postType === 'FOUND'}
                  onChange={() => setPostType('FOUND')}
                />
                <span className="ml-2">Found Item</span>
              </label>
            </div>
          </div>
          
          {/* Item Name */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Item Name
            </label>
            <input
              type="text"
              id="title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What item did you lose/find?"
            />
          </div>
          
          {/* Item Details */}
          <div className="mb-6">
            <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
              Item Details
            </label>
            <textarea
              id="details"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe the item and provide any relevant information"
              rows={3}
            />
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Creating...
                </>
              ) : (
                'Create Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostModal;