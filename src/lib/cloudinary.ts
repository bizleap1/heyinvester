import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';
import fs from 'node:fs/promises';
import path from 'node:path';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export const uploadToCloudinary = async (
  fileBase64: string,
  folder: string
): Promise<{ url: string; public_id: string }> => {
  // 1. Try uploading to Cloudinary
  if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
    try {
      const result = await cloudinary.uploader.upload(fileBase64, {
        folder,
        resource_type: 'auto',
      });
      return {
        url: result.secure_url,
        public_id: result.public_id,
      };
    } catch (error) {
      console.warn('Cloudinary upload unsuccessful, activating local storage fallback:', error);
    }
  }

  // 2. Reliable local storage fallback (so saving never fails)
  try {
    const matches = fileBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = 'jpg';

    if (matches && matches.length === 3) {
      const mime = matches[1].toLowerCase();
      if (mime.includes('png')) ext = 'png';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('svg')) ext = 'svg';
      else if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(fileBase64, 'base64');
    }

    const safeFolder = folder.replace(/[^a-zA-Z0-9_\-\/]/g, '').replace(/^\/+|\/+$/g, '');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', safeFolder);
    await fs.mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${safeFolder}/${fileName}`;
    return {
      url: publicUrl,
      public_id: `local_${safeFolder.replace(/\//g, '___')}___${fileName}`,
    };
  } catch (localErr) {
    console.error('Failed to save image locally:', localErr);
    throw new Error('Image upload failed');
  }
};

export const deleteFromCloudinary = async (publicId: string) => {
  if (!publicId) return;

  if (publicId.startsWith('local_')) {
    try {
      const clean = publicId.replace('local_', '');
      const parts = clean.split('___');
      if (parts.length >= 2) {
        const folderPath = parts[0].replace(/___/g, path.sep);
        const fileName = parts[parts.length - 1];
        const filePath = path.join(process.cwd(), 'public', 'uploads', folderPath, fileName);
        await fs.unlink(filePath).catch(() => {});
      }
    } catch (e) {
      console.warn('Failed to delete local file:', e);
    }
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

