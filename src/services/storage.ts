import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase.ts';
import { uploadActivityImageToCloud } from './cloud-sync.ts';

/**
 * Compresses an image file client-side to 3x4 portrait aspect ratio (ideal for KAJ Card)
 * Returns a high quality, low-payload dataURL string (~30-50KB).
 */
export async function compressMemberPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file foto jemaat.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format file gambar tidak valid.'));
      img.onload = () => {
        const targetWidth = 400;
        const targetHeight = 533; // 3:4 portrait ratio

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return resolve(img.src);
        }

        // Center-crop to 3:4
        const imgAspect = img.width / img.height;
        const targetAspect = targetWidth / targetHeight;

        let sx = 0;
        let sy = 0;
        let sw = img.width;
        let sh = img.height;

        if (imgAspect > targetAspect) {
          // Image is wider than 3:4, crop sides
          sw = img.height * targetAspect;
          sx = (img.width - sw) / 2;
        } else {
          // Image is taller than 3:4, crop top/bottom
          sh = img.width / targetAspect;
          sy = (img.height - sh) / 2;
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve(compressedDataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export interface UploadMemberPhotoResult {
  url: string;
  source: 'firebase_storage' | 'cloud_server' | 'compressed_data';
  storagePath?: string;
}

/**
 * Uploads member photo to Firebase Storage and returns public URL.
 * Automatically handles fallbacks so photo upload NEVER breaks.
 */
export async function uploadMemberPhotoToFirebase(
  file: File,
  memberIdOrName?: string
): Promise<UploadMemberPhotoResult> {
  // 1. First compress the photo
  const compressedDataUrl = await compressMemberPhoto(file);
  const cleanId = (memberIdOrName || 'member_' + Date.now()).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `members/${cleanId}_${Date.now()}.jpg`;

  // 2. Attempt direct upload to Firebase Storage
  try {
    const storageRef = ref(storage, filename);
    await uploadString(storageRef, compressedDataUrl, 'data_url', {
      contentType: 'image/jpeg',
    });
    const downloadUrl = await getDownloadURL(storageRef);
    return {
      url: downloadUrl,
      source: 'firebase_storage',
      storagePath: filename,
    };
  } catch (storageErr: any) {
    console.warn('[Firebase Storage] Could not upload directly to bucket, using cloud fallback:', storageErr?.message);
    
    // 3. Fallback: Save through the authenticated SYSJEGER image API.
    try {
      const cloudRecord = await uploadActivityImageToCloud(compressedDataUrl, {
        title: `Foto Jemaat: ${memberIdOrName || 'Anggota Jemaat'}`,
        category: 'Foto Anggota Jemaat',
        description: 'Pas Foto 3x4 Kartu Anggota Jemaat GMIT Betel Fuimelang',
      });
      return {
        url: cloudRecord.url,
        source: 'cloud_server',
        storagePath: `firestore:activity_images/${cloudRecord.id}`,
      };
    } catch (cloudErr) {
      console.warn('[Cloud API] Fallback to compressed Data URL:', cloudErr);
      return {
        url: compressedDataUrl,
        source: 'compressed_data',
      };
    }
  }
}
