import { optimizeImage } from './imageUtils';
import { Dispatch, SetStateAction } from 'react';

export const uploadGroupImage = async (
  file: File,
  setUploadProgress: Dispatch<SetStateAction<number>>,
  setIsUploading: Dispatch<SetStateAction<boolean>>
): Promise<string | null> => {
  try {
    setIsUploading(true);
    setUploadProgress(5);

    const optimizedFile = await optimizeImage(file);
    setUploadProgress(20);

    const formData = new FormData();
    formData.append('file', optimizedFile);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '');
    formData.append('folder', 'groupprofile');

    let progress = 20;
    const progressInterval = setInterval(() => {
      if (progress >= 90) {
        clearInterval(progressInterval);
        return;
      }
      progress += 10;
      setUploadProgress(progress);
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
      return optimizedUrl;
    }

    return null;
  } catch (err) {
    console.error('Cloudinary upload failed:', err);
    return null;
  } finally {
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
    }, 500);
  }
};
