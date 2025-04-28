export const optimizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      if (file.size <= 500 * 1024) { // 500KB
        resolve(file);
        return;
      }
  
      // Create temp canvas to resize image
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200; // Max dimension in pixels
        
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
        
        // Set canvas dimensions and draw resized image
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert canvas to Blob, then to File
        canvas.toBlob((blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, { 
              type: 'image/jpeg', 
              lastModified: Date.now() 
            });
            resolve(optimizedFile);
          } else {
            resolve(file); // Fallback to original if blob creation fails
          }
        }, 'image/jpeg', 0.8); // Set JPEG quality to 80%
      };
      
      img.src = URL.createObjectURL(file);
    });
  };