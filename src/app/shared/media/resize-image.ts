export const MAX_IMAGE_DIMENSION = 1600;
export const IMAGE_QUALITY = 0.85;

export async function resizeImage(source: Blob, maxDimension = MAX_IMAGE_DIMENSION): Promise<Blob> {
  const bitmap = await createImageBitmap(source);
  try {
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && source.type === 'image/jpeg') {
      return source;
    }
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Image encoding failed'))),
        'image/jpeg',
        IMAGE_QUALITY,
      ),
    );
  } finally {
    bitmap.close();
  }
}
