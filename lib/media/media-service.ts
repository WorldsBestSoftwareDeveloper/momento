export interface MediaPreview {
  url: string;
  durationSeconds: number;
}

export interface MediaService {
  createPreview(file: File): Promise<MediaPreview>;
  getDemoFile(): Promise<File>;
  releasePreview(url: string): void;
}

function readDuration(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = video.duration;
      video.removeAttribute("src");
      video.load();
      if (Number.isFinite(duration)) resolve(duration);
      else reject(new Error("We could not read this video's duration."));
    };
    video.onerror = () => reject(new Error("This MP4 could not be previewed. Try another file."));
    video.src = url;
  });
}

export const browserMediaService: MediaService = {
  async createPreview(file) {
    const url = URL.createObjectURL(file);
    try {
      return { url, durationSeconds: await readDuration(url) };
    } catch (error) {
      URL.revokeObjectURL(url);
      throw error;
    }
  },
  async getDemoFile() {
    const response = await fetch("/demo/upload-placeholder.mp4");
    if (!response.ok) throw new Error("The featured reaction clip is temporarily unavailable.");
    return new File([await response.blob()], "momento-featured-reaction.mp4", { type: "video/mp4" });
  },
  releasePreview(url) { URL.revokeObjectURL(url); },
};
