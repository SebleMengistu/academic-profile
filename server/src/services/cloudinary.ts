import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import config from '../config';
import { UploadResult } from '../types';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const uploadImage = async (
  buffer: Buffer,
  folder: string,
  options: { width?: number; height?: number; quality?: number } = {}
): Promise<UploadResult> => {
  const { width = 1200, height, quality = 85 } = options;

  // Process with Sharp
  let sharpInstance = sharp(buffer).webp({ quality });

  if (width || height) {
    sharpInstance = sharpInstance.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  const processedBuffer = await sharpInstance.toBuffer();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `academic-profile/${folder}`,
        resource_type: 'image',
        format: 'webp',
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Upload failed'));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        });
      }
    );
    stream.end(processedBuffer);
  });
};

export const uploadFile = async (
  buffer: Buffer,
  folder: string,
  fileName: string
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `academic-profile/${folder}`,
        resource_type: 'raw',
        public_id: fileName,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Upload failed'));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );
    stream.end(buffer);
  });
};

export const deleteFile = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

export const deleteRawFile = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
};
