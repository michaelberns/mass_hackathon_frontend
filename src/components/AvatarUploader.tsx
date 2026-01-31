import { useRef, useState } from 'react';
import { uploadMedia } from '../services/api';

interface AvatarUploaderProps {
  value: string;
  onChange: (url: string) => void;
  /** Shown in placeholder when no image (e.g. first letter of name) */
  placeholderLetter?: string;
  disabled?: boolean;
}

export function AvatarUploader({
  value,
  onChange,
  placeholderLetter,
  disabled = false,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    setUploadError(null);
    setIsUploading(true);
    try {
      const { images } = await uploadMedia({ images: [file] });
      if (images?.[0]) {
        onChange(images[0]);
      } else {
        setUploadError('Upload failed');
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          {value ? (
            <img
              src={value}
              alt=""
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <span className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-semibold text-gray-600 border-2 border-gray-200">
              {placeholderLetter ?? '?'}
            </span>
          )}
          {isUploading && (
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs font-medium">Uploading...</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            className="hidden"
            aria-label="Upload avatar image"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || isUploading}
            className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {value ? 'Change photo' : 'Upload photo'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={disabled || isUploading}
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Remove
            </button>
          )}
        </div>
      </div>
      {uploadError && (
        <p className="text-sm text-red-600">{uploadError}</p>
      )}
    </div>
  );
}
