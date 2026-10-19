import {
  MAX_UPLOAD_MB, UPLOAD_IMAGE_TYPES, describeUploadError, effectiveUploadType, validateUpload
} from './media-upload.util';

const MB = 1024 * 1024;
const file = (name: string, type: string, size = 1000) => ({ name, type, size });

describe('media-upload.util', () => {
  describe('effectiveUploadType', () => {
    it('uses the browser type, normalising the odd JPEG spellings', () => {
      expect(effectiveUploadType(file('a.jpg', 'image/jpg'))).toBe('image/jpeg');
      expect(effectiveUploadType(file('a.png', 'image/png'))).toBe('image/png');
    });

    it('works the type out from the extension when the browser gave none', () => {
      expect(effectiveUploadType(file('clip.MOV', ''))).toBe('video/quicktime');
      expect(effectiveUploadType(file('plan.docx', ''))).toContain('wordprocessingml');
      expect(effectiveUploadType(file('mystery', ''))).toBe('');
    });
  });

  describe('validateUpload', () => {
    it('accepts what the server accepts', () => {
      expect(validateUpload(file('a.jpg', 'image/jpeg'))).toBeNull();
      expect(validateUpload(file('a.mp4', 'video/mp4', 50 * MB))).toBeNull();
      expect(validateUpload(file('a.pdf', 'application/pdf'))).toBeNull();
      expect(validateUpload(file('notes.txt', 'text/plain'))).toBeNull();
      expect(validateUpload(file('memo.m4a', 'audio/mp4'))).toBeNull();
    });

    it('accepts a file with no browser type when its extension is known', () => {
      expect(validateUpload(file('clip.mov', ''))).toBeNull();
    });

    it('refuses types the server would reject, naming what is allowed', () => {
      const msg = validateUpload(file('setup.exe', 'application/x-msdownload'));
      expect(msg).toContain("isn't supported");
      expect(msg).toContain('JPEG');
      expect(validateUpload(file('page.html', 'text/html'))).toContain("isn't supported");
      expect(validateUpload(file('logo.svg', 'image/svg+xml'))).toContain("isn't supported");
      expect(validateUpload(file('data.zip', 'application/zip'))).toContain("isn't supported");
    });

    it('refuses an empty file', () => {
      expect(validateUpload(file('a.jpg', 'image/jpeg', 0))).toContain('empty');
    });

    it('refuses a file over the server limit, and says how big it is', () => {
      const msg = validateUpload(file('big.mp4', 'video/mp4', 85 * MB));
      expect(msg).toContain('85 MB');
      expect(msg).toContain(`${MAX_UPLOAD_MB} MB`);
      expect(msg).toContain('trimming');
    });

    it('applies a caller\'s tighter rules', () => {
      const photosOnly = { allowedTypes: UPLOAD_IMAGE_TYPES, maxMb: 5 };
      expect(validateUpload(file('a.jpg', 'image/jpeg', 4 * MB), photosOnly)).toBeNull();
      expect(validateUpload(file('a.jpg', 'image/jpeg', 6 * MB), photosOnly)).toContain('limit is 5 MB');
      expect(validateUpload(file('a.mp4', 'video/mp4'), photosOnly)).toContain("isn't supported");
      // a caller can tighten the server limit but never raise it
      expect(validateUpload(file('a.jpg', 'image/jpeg', 70 * MB), { maxMb: 500 })).toContain(`${MAX_UPLOAD_MB} MB`);
    });
  });

  describe('describeUploadError', () => {
    it('explains each failure in plain words', () => {
      expect(describeUploadError({ status: 413 })).toContain('too large');
      expect(describeUploadError({ status: 0 })).toContain('connection');
      expect(describeUploadError({ status: 0, error: { message: 'The server is taking too long to respond.' } }))
        .toContain('taking too long');
      expect(describeUploadError({ status: 400, error: { message: 'Unsupported or invalid file.' } }))
        .toBe('Unsupported or invalid file.');
      expect(describeUploadError({ status: 401 })).toContain('sign in');
      expect(describeUploadError({ status: 502, error: { detail: 'Strapi said no' } })).toContain('Strapi said no');
      expect(describeUploadError({ status: 502 })).toContain('not responding');
      expect(describeUploadError({ status: 500 })).toBe('Upload failed. Please try again.');
    });
  });
});
