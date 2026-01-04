// src/utils/imageOptimizer.ts
import imageCompression from 'browser-image-compression';

export const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 0.8, // Compress to ~800KB
    maxWidthOrHeight: 1920, // Resize if wider than 1920px
    useWebWorker: true,
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error("Image compression failed, using original file", error);
    return file;
  }
};