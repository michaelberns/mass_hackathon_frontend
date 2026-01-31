import { useRef, useEffect, useState } from 'react';

interface MediaUploaderProps {
  images: File[];
  video?: File;
  onImagesChange: (files: File[]) => void;
  onVideoChange: (file: File | undefined) => void;
  maxImages?: number;
  /** Existing image URLs (e.g. from edit) - shown with option to remove */
  existingImageUrls?: string[];
  existingVideoUrl?: string;
  onRemoveExistingImage?: (index: number) => void;
  onRemoveExistingVideo?: () => void;
  isUploading?: boolean;
  uploadError?: string | null;
}

export function MediaUploader({
  images,
  video,
  onImagesChange,
  onVideoChange,
  maxImages = 10,
  existingImageUrls = [],
  existingVideoUrl,
  onRemoveExistingImage,
  onRemoveExistingVideo,
  isUploading = false,
  uploadError = null,
}: MediaUploaderProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  // Sync object URLs for selected image files; revoke on cleanup
  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [images]);

  // Sync video preview URL
  useEffect(() => {
    if (!video) {
      setVideoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(video);
    setVideoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [video]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > maxImages) {
      return;
    }
    onImagesChange([...images, ...files]);
    e.target.value = '';
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    onVideoChange(file);
    e.target.value = '';
  };

  const removeNewImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const removeNewVideo = () => {
    onVideoChange(undefined);
    videoInputRef.current && (videoInputRef.current.value = '');
  };

  const totalImageCount = existingImageUrls.length + images.length;
  const canAddMoreImages = totalImageCount < maxImages;

  return (
    <div className="space-y-6 relative">
      {isUploading && (
        <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Uploading media...</p>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {uploadError}
        </div>
      )}

      {/* Existing images (edit mode) */}
      {existingImageUrls.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current images ({existingImageUrls.length})
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {existingImageUrls.map((url, index) => (
              <div key={`existing-${index}`} className="relative group">
                <img
                  src={url}
                  alt={`Current ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                {onRemoveExistingImage && (
                  <button
                    type="button"
                    onClick={() => onRemoveExistingImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 text-sm font-medium"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New image file input + previews */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {existingImageUrls.length ? 'Add more images' : 'Images'} ({totalImageCount}/{maxImages})
        </label>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={!canAddMoreImages}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {images.length ? 'Add more images' : 'Choose images'}
        </button>

        {imagePreviewUrls.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            {imagePreviewUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600"
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Existing video (edit mode) */}
      {existingVideoUrl && !video && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current video</label>
          <div className="relative">
            <video
              src={existingVideoUrl}
              controls
              className="w-full max-h-64 rounded-lg border border-gray-200"
            />
            {onRemoveExistingVideo && (
              <button
                type="button"
                onClick={onRemoveExistingVideo}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600"
                aria-label="Remove video"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* New video file input + preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {existingVideoUrl || video ? 'Replace video' : 'Video (optional)'}
        </label>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
        >
          {video ? 'Change video' : 'Choose video'}
        </button>

        {video && videoPreviewUrl && (
          <div className="mt-4 relative">
            <video
              src={videoPreviewUrl}
              controls
              className="w-full max-h-64 rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={removeNewVideo}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600"
              aria-label="Remove video"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
