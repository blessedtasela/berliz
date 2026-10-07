import { POST_VIDEO_MAX_MB, validatePostVideo } from './post-media.util';

describe('validatePostVideo', () => {
  const mb = (n: number) => n * 1024 * 1024;

  it('accepts MP4, WebM and MOV within the size limit', () => {
    expect(validatePostVideo({ type: 'video/mp4', size: mb(10) })).toBeNull();
    expect(validatePostVideo({ type: 'video/webm', size: mb(10) })).toBeNull();
    expect(validatePostVideo({ type: 'video/quicktime', size: mb(10) })).toBeNull();
  });

  it('rejects anything that is not one of those video types', () => {
    expect(validatePostVideo({ type: 'image/png', size: 100 })).toContain('MP4');
    expect(validatePostVideo({ type: 'application/pdf', size: 100 })).toContain('MP4');
    expect(validatePostVideo({ type: '', size: 100 })).toContain('MP4');
  });

  it('allows exactly the limit and rejects one byte over', () => {
    expect(validatePostVideo({ type: 'video/mp4', size: mb(POST_VIDEO_MAX_MB) })).toBeNull();
    expect(validatePostVideo({ type: 'video/mp4', size: mb(POST_VIDEO_MAX_MB) + 1 })).toContain(String(POST_VIDEO_MAX_MB));
  });
});
