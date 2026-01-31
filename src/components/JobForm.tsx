import { useState, type FormEvent } from 'react';
import type { Job } from '../types';
import type { JobFormData } from '../types';
import { MediaUploader } from './MediaUploader';
import { LocationPicker } from './LocationPicker';
import { uploadMedia } from '../services/api';
import { compressImagesToMaxSize } from '../utils/imageCompression';
import { createEstimatorSession, getEstimatedPrice, parsePriceString } from '../services/estimatorApi';

interface JobFormProps {
  initialData?: Partial<Job>;
  onSubmit: (data: JobFormData) => Promise<void>;
  submitLabel: string;
  onCancel?: () => void;
}

export function JobForm({
  initialData,
  onSubmit,
  submitLabel,
  onCancel,
}: JobFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [location, setLocation] = useState(initialData?.location ?? '');
  const [latitude, setLatitude] = useState<number | undefined>(initialData?.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(initialData?.longitude);
  const [budget, setBudget] = useState(
    initialData?.budget != null ? String(initialData.budget) : ''
  );
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    initialData?.images ?? []
  );
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | undefined>(
    initialData?.video
  );
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newVideoFile, setNewVideoFile] = useState<File | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimationError, setEstimationError] = useState<string | null>(null);

  const handleEstimatePrice = async (): Promise<number> => {
    // Validate description
    if (!description.trim()) {
      throw new Error('Please enter a job description');
    }

    // Validate image
    const imageToUse = newImageFiles[0];
    if (!imageToUse) {
      throw new Error('Please upload at least one image');
    }

    // Step 1: Create session
    const sessionId = await createEstimatorSession();

    // Step 2: Get estimate
    const estimateText = await getEstimatedPrice(sessionId, description, imageToUse);

    // Step 3: Parse and return price
    const priceValue = parsePriceString(estimateText);
    return priceValue;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setUploadError(null);
    setEstimationError(null);
    setIsSubmitting(true);

    try {
      // Require description
      if (!description.trim()) {
        setError('Please enter a job description.');
        setIsSubmitting(false);
        return;
      }

      // Require at least one image (existing or new)
      const hasAtLeastOneImage = existingImageUrls.length > 0 || newImageFiles.length > 0;
      if (!hasAtLeastOneImage) {
        setError('Please upload at least one image.');
        setIsSubmitting(false);
        return;
      }

      // Require location text and coordinates (user must select a location on the map)
      if (!location.trim()) {
        setError('Please enter and select a location (search for an address or click on the map).');
        setIsSubmitting(false);
        return;
      }
      if (latitude == null || longitude == null) {
        setError('Please select a location on the map (search for an address or click on the map to set the pin).');
        setIsSubmitting(false);
        return;
      }

      let priceToUse = budget ? parseFloat(budget) : 0;

      // For new jobs (not editing), estimate price automatically
      if (!initialData) {
        setIsEstimating(true);
        try {
          priceToUse = await handleEstimatePrice();
          setEstimationError(null);
        } catch (err) {
          setEstimationError(err instanceof Error ? err.message : 'Failed to estimate price');
          setIsSubmitting(false);
          setIsEstimating(false);
          return;
        } finally {
          setIsEstimating(false);
        }
      }

      let finalImageUrls = [...existingImageUrls];
      let finalVideoUrl = existingVideoUrl;

      if (newImageFiles.length > 0 || newVideoFile) {
        setIsUploading(true);
        try {
          const imagesToUpload =
            newImageFiles.length > 0
              ? await compressImagesToMaxSize(newImageFiles)
              : undefined;
          const result = await uploadMedia({
            images: imagesToUpload,
            video: newVideoFile,
          });
          finalImageUrls = [...finalImageUrls, ...(result.images ?? [])];
          if (result.video != null) finalVideoUrl = result.video;
        } catch (err) {
          setUploadError(err instanceof Error ? err.message : 'Upload failed');
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      await onSubmit({
        title,
        description,
        location,
        budget: priceToUse,
        images: finalImageUrls,
        video: finalVideoUrl,
        latitude,
        longitude,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingVideo = () => {
    setExistingVideoUrl(undefined);
  };

  const isDisabled = isSubmitting || isUploading || isEstimating;

  return (
    <>
      {/* AI estimating overlay: popped-out modal with clear message and modern spinner */}
      {isEstimating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative rounded-2xl bg-white shadow-2xl border border-gray-100 p-8 sm:p-10 max-w-sm w-full text-center ai-estimate-modal-card">
            <div className="mx-auto w-20 h-20 rounded-full border-4 border-gray-100 border-t-amber-500 border-r-purple-500 border-b-blue-500 border-l-emerald-500 animate-spin mb-6" aria-hidden />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              AI is estimating your price
            </h3>
            <p className="text-sm text-gray-500 mb-1">
              Our AI is analysing your description and images to suggest a fair price.
            </p>
            <p className="text-xs text-gray-400">
              This usually takes a few seconds…
            </p>
          </div>
        </div>
      )}

    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {estimationError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {estimationError}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-text mb-1">
          Job Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 bg-input-bg border border-input-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-text transition-colors"
          placeholder="e.g., Garden Cleanup and Landscaping"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={5}
          className="w-full px-3 py-2 bg-input-bg border border-input-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-text transition-colors"
          placeholder="Describe the job in detail..."
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location *
        </label>
        <LocationPicker
          value={{ location, latitude, longitude }}
          onChange={({ location: loc, latitude: lat, longitude: lng }) => {
            setLocation(loc);
            setLatitude(lat);
            setLongitude(lng);
          }}
          disabled={isDisabled}
        />
      </div>

      {/* Budget field - only shown when editing */}
      {initialData && (
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-text mb-1">
            Budget ($) *
          </label>
          <input
            type="number"
            id="budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
            disabled={isDisabled}
          />
        </div>
      )}

      {/* Price estimation notice for new jobs */}
      {!initialData && (
        <div className="p-4 bg-accent-muted/30 border-2 border-accent/30 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-text-inverse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-text mb-1">AI-Powered Pricing</h3>
              <p className="text-sm text-text-muted">
                The job price will be automatically determined by our AI based on your description and uploaded images when you submit.
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Media * (at least one image)</label>
        <MediaUploader
          images={newImageFiles}
          video={newVideoFile}
          onImagesChange={setNewImageFiles}
          onVideoChange={setNewVideoFile}
          maxImages={10}
          existingImageUrls={existingImageUrls}
          existingVideoUrl={existingVideoUrl}
          onRemoveExistingImage={handleRemoveExistingImage}
          onRemoveExistingVideo={handleRemoveExistingVideo}
          isUploading={isUploading}
          uploadError={uploadError}
        />
      </div>

      <div className="flex gap-4 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isDisabled}
            className="flex-1 px-4 py-3 border border-border rounded-lg text-text hover:bg-background-alt font-medium disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isDisabled}
          className="flex-1 px-4 py-3 bg-accent text-text-inverse rounded-lg hover:bg-accent-hover font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {isEstimating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Estimating the price...
            </>
          ) : isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading media...
            </>
          ) : isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
    </>
  );
}
