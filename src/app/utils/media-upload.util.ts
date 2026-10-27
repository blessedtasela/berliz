/**
 * What the server's /strapi/upload will accept (mirrors FileUtilities.isAllowedGeneralUpload and
 * spring.servlet.multipart.max-file-size on the backend). Checking here first means a doomed upload
 * is refused in a second with a reason, instead of pushing tens of megabytes up a phone connection
 * only to be told "Upload failed".
 */
export const MAX_UPLOAD_MB = 60;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

export const UPLOAD_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const UPLOAD_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
export const UPLOAD_PDF_TYPES = ['application/pdf'];
export const UPLOAD_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword', 'application/vnd.ms-excel', 'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv',
];
export const UPLOAD_AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/x-wav'];
export const UPLOAD_ALL_TYPES = [...UPLOAD_IMAGE_TYPES, ...UPLOAD_VIDEO_TYPES, ...UPLOAD_DOCUMENT_TYPES, ...UPLOAD_AUDIO_TYPES];

const EXTENSION_TYPES: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp',
  mp4: 'video/mp4', m4v: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm', pdf: 'application/pdf',
  doc: 'application/msword', xls: 'application/vnd.ms-excel', ppt: 'application/vnd.ms-powerpoint',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain', csv: 'text/csv', mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav',
};

/**
 * `image/jpg` is what some devices report for a JPEG. A MIME type can also carry parameters
 * (`video/webm;codecs=vp9`, which is exactly what the browser's MediaRecorder labels a trimmed clip), and those are
 * not part of the type: comparing the whole string made every trimmed video "an unsupported file type".
 */
function normalizeType(type: string): string {
  const t = (type || '').split(';')[0].trim().toLowerCase();
  return t === 'image/jpg' || t === 'image/pjpeg' ? 'image/jpeg' : t;
}

/** The MIME type to upload as: the browser's own when it gave one, else inferred from the extension. */
export function effectiveUploadType(file: { name: string; type: string }): string {
  const declared = normalizeType(file.type);
  if (declared) return declared;
  const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.') + 1).toLowerCase() : '';
  return EXTENSION_TYPES[ext] ?? '';
}

export interface UploadRules {
  /** Narrower than the server's list, e.g. photos only. Defaults to everything the server takes. */
  allowedTypes?: string[];
  /** Tighter than the server's cap, e.g. 5 for profile photos. */
  maxMb?: number;
}

/** Why this file can't be uploaded, in words the user can act on; null when it can. */
export function validateUpload(file: { name: string; type: string; size: number }, rules: UploadRules = {}): string | null {
  const allowed = rules.allowedTypes ?? UPLOAD_ALL_TYPES;
  const type = effectiveUploadType(file);
  if (file.size <= 0) return 'That file is empty.';
  if (!type || !allowed.includes(type)) {
    return `That file type isn't supported. Use ${describeTypes(allowed)}.`;
  }
  const maxMb = Math.min(rules.maxMb ?? MAX_UPLOAD_MB, MAX_UPLOAD_MB);
  if (file.size > maxMb * 1024 * 1024) {
    const sizeMb = file.size / (1024 * 1024);
    return `That file is ${sizeMb >= 10 ? Math.round(sizeMb) : sizeMb.toFixed(1)} MB; the limit is ${maxMb} MB.`
      + (allowed.some(t => t.startsWith('video/')) && type.startsWith('video/') ? ' Try trimming or compressing the video.' : '');
  }
  return null;
}

function describeTypes(types: string[]): string {
  const names = new Set<string>();
  for (const t of types) {
    if (t === 'image/jpeg') names.add('JPEG');
    else if (t === 'image/png') names.add('PNG');
    else if (t === 'image/gif') names.add('GIF');
    else if (t === 'image/webp') names.add('WebP');
    else if (t === 'video/mp4') names.add('MP4');
    else if (t === 'video/quicktime') names.add('MOV');
    else if (t === 'video/webm') names.add('WebM');
    else if (t === 'application/pdf') names.add('PDF');
    else if (t === 'application/msword' || t.endsWith('wordprocessingml.document')) names.add('Word');
    else if (t === 'application/vnd.ms-excel' || t.endsWith('spreadsheetml.sheet')) names.add('Excel');
    else if (t === 'application/vnd.ms-powerpoint' || t.endsWith('presentationml.presentation')) names.add('PowerPoint');
    else if (t === 'text/plain' || t === 'text/csv') names.add('text/CSV');
    else if (t.startsWith('audio/')) names.add('MP3/M4A/WAV audio');
  }
  const list = [...names];
  return list.length > 1 ? `${list.slice(0, -1).join(', ')} or ${list[list.length - 1]}` : list[0] ?? 'a supported file';
}

/** A readable reason for a failed upload request, whatever shape the failure came in. */
export function describeUploadError(err: any): string {
  const status = err?.status;
  const serverMessage = err?.error?.message;
  const detail = err?.error?.detail;
  if (status === 413) return `That file is too large. The limit is ${MAX_UPLOAD_MB} MB.`;
  if (status === 0) {
    return serverMessage || 'Could not reach the server. Check your connection and try again.';
  }
  if (status === 400 && serverMessage) return serverMessage;
  if (status === 401 || status === 403) return 'You need to sign in again to upload files.';
  if (status === 502 || status === 503 || status === 504) {
    return detail
      ? `The media server rejected the upload: ${detail}`
      : 'The media server is not responding right now. Try again in a minute.';
  }
  return serverMessage || 'Upload failed. Please try again.';
}
