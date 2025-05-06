import React from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string;
  altText: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, altText, onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4" 
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 p-1 rounded-full text-white hover:bg-opacity-70 transition-all"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        
        <div className="relative w-full h-full flex items-center justify-center">
          <img 
            src={imageUrl} 
            alt={altText} 
            className="max-w-full max-h-[85vh] object-contain rounded-lg" 
          />
        </div>
      </div>
    </div>
  );
};

export default ImageModal;