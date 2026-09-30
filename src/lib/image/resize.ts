/**
 * 브라우저에서 사진을 축소·재인코딩한다.
 *
 * - 업로드 용량을 줄이고 (최대 변 1280px, JPEG)
 * - 캔버스로 다시 그리므로 EXIF(촬영 위치 GPS 등) 메타데이터가 제거된다 → 개인정보 보호
 */
export async function resizeImage(file: File, maxSize = 1280, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("이미지를 처리할 수 없어요.");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("이미지를 변환할 수 없어요."))), "image/jpeg", quality);
  });
}
