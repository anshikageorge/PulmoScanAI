/**
 * Converts any image (SVG data URL, blob, or base64) into a clean JPEG/PNG base64 string
 * suitable for multimodal vision APIs.
 */
export async function prepareImageForAnalysis(
  imageUrl: string,
  fallbackMime: string = 'image/jpeg'
): Promise<{ base64: string; mimeType: string }> {
  // If already standard raster base64
  if (
    imageUrl.startsWith('data:image/jpeg;base64,') ||
    imageUrl.startsWith('data:image/png;base64,') ||
    imageUrl.startsWith('data:image/webp;base64,')
  ) {
    const parts = imageUrl.split('base64,');
    const mime = imageUrl.split(';')[0].replace('data:', '');
    return { base64: parts[1], mimeType: mime };
  }

  // For SVG data URLs or other formats, draw onto canvas to get standard raster JPEG
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const parts = imageUrl.includes('base64,') ? imageUrl.split('base64,')[1] : imageUrl;
          return resolve({ base64: parts, mimeType: fallbackMime });
        }
        ctx.fillStyle = '#05080c';
        ctx.fillRect(0, 0, 512, 512);
        ctx.drawImage(img, 0, 0, 512, 512);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        const parts = dataUrl.split('base64,');
        resolve({ base64: parts[1], mimeType: 'image/jpeg' });
      } catch (err) {
        console.warn('Canvas conversion fallback:', err);
        const parts = imageUrl.includes('base64,') ? imageUrl.split('base64,')[1] : imageUrl;
        resolve({ base64: parts, mimeType: fallbackMime });
      }
    };
    img.onerror = () => {
      const parts = imageUrl.includes('base64,') ? imageUrl.split('base64,')[1] : imageUrl;
      resolve({ base64: parts, mimeType: fallbackMime });
    };
    img.src = imageUrl;
  });
}
