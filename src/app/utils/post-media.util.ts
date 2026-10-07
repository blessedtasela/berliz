/** What a post may carry: one photo OR one video. The video limits mirror the trainer Feature Videos upload. */
export const POST_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
export const POST_VIDEO_MAX_MB = 50;

/** Why a chosen file can't be posted as a video, in words the user can act on; null when it can. */
export function validatePostVideo(file: { type: string; size: number }): string | null {
  if (!POST_VIDEO_TYPES.includes(file.type)) return 'Please choose an MP4, WebM or MOV video';
  if (file.size > POST_VIDEO_MAX_MB * 1024 * 1024) return `Video must be under ${POST_VIDEO_MAX_MB}MB`;
  return null;
}
