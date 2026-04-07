import React, { useRef, useCallback } from 'react';
import { UploadIcon, XCircleIcon } from './icons';

interface ImageUploaderProps {
  onImageSelect: (file: File | null) => void;
  imageUrl: string | null;
  disabled: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, imageUrl, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    onImageSelect(file || null);
    // Reset file input to allow re-selection of the same file
    if(event.target) event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    onImageSelect(file || null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const triggerFileSelect = useCallback(() => {
    if (!disabled) {
        fileInputRef.current?.click();
    }
  }, [disabled]);

  const clearImage = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onImageSelect(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={disabled}
      />
      {imageUrl ? (
        <div className="relative group rounded-lg overflow-hidden">
          <img src={imageUrl} alt="Preview" className="w-full h-auto max-h-80 object-contain rounded-lg" />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
                onClick={clearImage} 
                disabled={disabled}
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed">
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={triggerFileSelect}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`border-2 border-dashed border-slate-600 rounded-lg p-8 text-center transition-colors ${
            disabled ? 'cursor-not-allowed bg-slate-800' : 'cursor-pointer hover:border-cyan-400 hover:bg-slate-700/50'
          }`}
        >
          <div className="flex flex-col items-center text-slate-400">
            <UploadIcon className="w-12 h-12 mb-4" />
            <p className="font-semibold">Click to upload or drag & drop</p>
            <p className="text-sm">PNG, JPG, WEBP, or GIF</p>
          </div>
        </div>
      )}
    </div>
  );
};
