// 이미지 압축 유틸리티
// 최대 1MB 이하로 이미지 압축

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1440;
const INITIAL_QUALITY = 0.9;
const MIN_QUALITY = 0.5;
const QUALITY_STEP = 0.1;

/**
 * 이미지를 1MB 이하로 압축
 * @param file - 원본 이미지 File 또는 Blob
 * @returns 압축된 이미지 File
 */
export async function compressImage(file: File | Blob): Promise<File> {
  // 이미 1MB 이하면 그대로 반환
  if (file.size <= MAX_FILE_SIZE) {
    if (file instanceof File) {
      return file;
    }
    return new File([file], 'submission.jpg', { type: 'image/jpeg' });
  }

  // 이미지 로드
  const imageBitmap = await createImageBitmap(file);

  // 리사이즈 비율 계산
  let { width, height } = imageBitmap;

  if (width > MAX_WIDTH || height > MAX_HEIGHT) {
    const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  // 캔버스에 그리기
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context를 생성할 수 없습니다');
  }

  ctx.drawImage(imageBitmap, 0, 0, width, height);

  // 품질을 낮춰가며 1MB 이하가 될 때까지 압축
  let quality = INITIAL_QUALITY;
  let blob: Blob | null = null;

  while (quality >= MIN_QUALITY) {
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', quality);
    });

    if (blob && blob.size <= MAX_FILE_SIZE) {
      break;
    }

    quality -= QUALITY_STEP;
  }

  // 여전히 크면 추가 리사이즈
  if (!blob || blob.size > MAX_FILE_SIZE) {
    const additionalRatio = Math.sqrt(MAX_FILE_SIZE / (blob?.size || file.size));
    const newWidth = Math.round(width * additionalRatio);
    const newHeight = Math.round(height * additionalRatio);

    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.drawImage(imageBitmap, 0, 0, newWidth, newHeight);

    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', MIN_QUALITY);
    });
  }

  if (!blob) {
    throw new Error('이미지 압축에 실패했습니다');
  }

  // 정리
  imageBitmap.close();

  return new File([blob], 'submission.jpg', { type: 'image/jpeg' });
}

/**
 * Base64 데이터를 압축된 File로 변환
 * @param base64 - Base64 이미지 데이터 (data:image/... 형식)
 * @returns 압축된 이미지 File
 */
export async function compressBase64Image(base64: string): Promise<File> {
  // Base64를 Blob으로 변환
  const response = await fetch(base64);
  const blob = await response.blob();

  // 압축 적용
  return compressImage(blob);
}

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 * @param bytes - 바이트 크기
 * @returns 포맷된 문자열 (예: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
