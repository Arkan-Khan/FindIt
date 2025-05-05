// utils/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const deleteCloudinaryImage = async (imageUrl: string) => {
  try {
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1]; // e.g. abc123.jpg
    const publicIdWithExt = filename.split('.')[0]; // abc123
    const folder = parts[parts.length - 2]; // e.g., userprofile

    const public_id = `${folder}/${publicIdWithExt}`;

    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.error('❌ Failed to delete image from Cloudinary:', error);
  }
};

export default cloudinary;
