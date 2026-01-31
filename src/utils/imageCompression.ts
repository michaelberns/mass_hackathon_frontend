const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4MB

/**
 * Load a File (image) into an HTMLImageElement.
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

/**
 * Compress an image file to at most maxSizeBytes (default 4MB).
 * Uses canvas + JPEG quality and/or scale. Returns original file if already under limit.
 */
export async function compressImageToMaxSize(
  file: File,
  maxSizeBytes: number = MAX_SIZE_BYTES
): Promise<File> {
  if (file.size <= maxSizeBytes) {
    return file;
  }

  if (!file.type.startsWith('image/')) {
    return file;
  }

  const img = await loadImage(file);
  let width = img.naturalWidth;
  let height = img.naturalHeight;
  let quality = 0.9;

  const maxDimension = 2048;
  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2d not available');
  ctx.drawImage(img, 0, 0, width, height);

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
  const outputType = 'image/jpeg';

  while (quality > 0.1) {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, outputType, quality);
    });
    if (!blob) throw new Error('Failed to compress image');
    if (blob.size <= maxSizeBytes) {
      return new File([blob], `${baseName}.jpg`, { type: outputType });
    }
    quality -= 0.1;
  }

  // Last resort: scale down further
  const scale = Math.sqrt(maxSizeBytes / (canvas.width * canvas.height * 0.1));
  const w2 = Math.max(320, Math.round(canvas.width * scale));
  const h2 = Math.max(240, Math.round(canvas.height * scale));
  canvas.width = w2;
  canvas.height = h2;
  const ctx2 = canvas.getContext('2d');
  if (!ctx2) throw new Error('Canvas 2d not available');
  ctx2.drawImage(img, 0, 0, w2, h2);

  const finalBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, outputType, 0.8);
  });
  if (!finalBlob) throw new Error('Failed to compress image');
  return new File([finalBlob], `${baseName}.jpg`, { type: outputType });
}

/**
 * Compress multiple image files to at most 4MB each. Non-image files are returned as-is.
 */
export async function compressImagesToMaxSize(
  files: File[],
  maxSizeBytes: number = MAX_SIZE_BYTES
): Promise<File[]> {
  return Promise.all(
    files.map((file) =>
      file.type.startsWith('image/')
        ? compressImageToMaxSize(file, maxSizeBytes)
        : Promise.resolve(file)
    )
  );
}
