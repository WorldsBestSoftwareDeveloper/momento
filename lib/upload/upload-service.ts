export const MAX_VIDEO_BYTES = 25 * 1024 * 1024;
export const MAX_VIDEO_SECONDS = 15;

export interface UploadRequest {
  file: File;
  previewUrl: string;
  onProgress: (progress: number) => void;
}

export interface UploadedMedia {
  path: string;
  playbackUrl: string;
  byteSize: number;
}

export interface UploadService {
  upload(request: UploadRequest): Promise<UploadedMedia>;
}

export function validateVideoFile(file: File): string | null {
  if (file.type !== "video/mp4" || !file.name.toLowerCase().endsWith(".mp4")) return "Choose an MP4 video file.";
  if (file.size > MAX_VIDEO_BYTES) return "Your video must be 25 MB or smaller.";
  if (file.size === 0) return "This video file is empty.";
  return null;
}

export function validateVideoDuration(seconds: number): string | null {
  if (seconds <= 0 || !Number.isFinite(seconds)) return "We could not verify this video's duration.";
  if (seconds > MAX_VIDEO_SECONDS) return "Your Moment must be 15 seconds or shorter.";
  return null;
}

const wait = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export const localDemoUploadService: UploadService = {
  async upload({ file, previewUrl, onProgress }) {
    for (const progress of [8, 18, 34, 52, 71, 88, 100]) {
      await wait(150);
      onProgress(progress);
    }
    return {
      path: `demo-local/${crypto.randomUUID()}-${file.name}`,
      playbackUrl: previewUrl,
      byteSize: file.size,
    };
  },
};
