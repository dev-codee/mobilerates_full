"use client";
import { notify } from "@/app/lib/notifications";


import { useState } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';

interface ImageAsset {
  url: string;
  cloud_public_id: string;
  is_primary?: boolean;
  alt_text?: string;
  width?: number;
  height?: number;
}

interface ImageUploaderProps {
  onImagesChange: (images: ImageAsset[]) => void;
  existingImages?: ImageAsset[];
}

export default function ImageUploader({ onImagesChange, existingImages = [] }: ImageUploaderProps) {
  const [images, setImages] = useState<ImageAsset[]>(existingImages);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    setIsUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const token = Cookies.get('admin_token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');
        
        const data = await response.json();
        return {
          url: data.data.url,
          cloud_public_id: data.data.cloud_public_id,
          width: data.data.width,
          height: data.data.height,
          is_primary: false, 
        };
      });

      const newImages = await Promise.all(uploadPromises);
      
      const updatedImages = [...images, ...newImages];
      if (updatedImages.length > 0 && !updatedImages.some(img => img.is_primary)) {
        updatedImages[0].is_primary = true;
      }
      
      setImages(updatedImages);
      onImagesChange(updatedImages);
    } catch (error) {
      console.error("Error uploading images:", error);
      notify("Failed to upload one or more images");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    if (updatedImages.length > 0 && images[index].is_primary) {
        updatedImages[0].is_primary = true;
    }
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const setPrimary = (index: number) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }));
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {images.map((img, index) => (
          <div key={img.cloud_public_id || index} className="relative group rounded-lg overflow-hidden border border-gray-200">
            <img src={img.url} alt="Phone upload" className="w-full h-32 object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <button 
                type="button"
                onClick={() => removeImage(index)}
                className="bg-white text-red-600 p-1 rounded-full hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </button>
              {!img.is_primary && (
                <button 
                  type="button"
                  onClick={() => setPrimary(index)}
                  className="bg-white text-xs px-2 py-1 rounded text-gray-900 font-medium"
                >
                  Set Primary
                </button>
              )}
            </div>
            {img.is_primary && (
              <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                PRIMARY
              </div>
            )}
          </div>
        ))}
        
        <label className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          ) : (
            <>
              <UploadCloud className="w-8 h-8 text-gray-400" />
              <span className="mt-2 text-sm text-gray-500 font-medium">Add Image</span>
            </>
          )}
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} multiple />
        </label>
      </div>
    </div>
  );
}
