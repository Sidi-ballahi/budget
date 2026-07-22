// Downscales + re-encodes a receipt photo client-side before it's stored as a
// base64 data URL (Transaction.justificatif), so a 12MP camera photo doesn't
// blow past the DB column / IndexedDB or the offline sync payload size.
export async function compressImageFile(file: File, maxDim = 1280, quality = 0.7): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas non supporté");
  ctx.drawImage(bitmap, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", quality);
}
