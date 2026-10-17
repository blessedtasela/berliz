import { UrlLowerCaseSerializer } from 'url-lower-case-serializer';

describe('UrlLowerCaseSerializer', () => {
  const serializer = new UrlLowerCaseSerializer();

  it('lowercases the path', () => {
    expect(serializer.serialize(serializer.parse('/Dashboard/My-Bookings'))).toBe('/dashboard/my-bookings');
  });

  // Regression: query keys were lowercased too, so `?returnUrl=` and `?postId=` arrived as `returnurl` / `postid`
  // and the code reading `returnUrl` / `postId` never saw them (login redirects and notification deep links broke).
  it('keeps the case of query keys and values', () => {
    const tree = serializer.parse('/Dashboard/Timeline?postId=42&returnUrl=%2Fdashboard%2Fmy-bookings&token=AbCdEf');

    expect(tree.queryParamMap.get('postId')).toBe('42');
    expect(tree.queryParamMap.get('returnUrl')).toBe('/dashboard/my-bookings');
    expect(tree.queryParamMap.get('token')).toBe('AbCdEf');
    expect(serializer.serialize(tree)).toContain('postId=42');
  });

  it('keeps the case of query params on URLs built by the router', () => {
    const tree = serializer.parse('/login');
    tree.queryParams = { returnUrl: '/dashboard/Runs', logId: '7' };

    const url = serializer.serialize(tree);

    expect(url.startsWith('/login?')).toBeTrue();
    expect(url).toContain('returnUrl=');
    expect(url).toContain('logId=7');
    expect(url).toContain('%2Fdashboard%2FRuns');
  });

  it('keeps the fragment untouched', () => {
    expect(serializer.serialize(serializer.parse('/About#OurMission'))).toBe('/about#OurMission');
  });

  it('lowercases a path that has no query string', () => {
    expect(serializer.serialize(serializer.parse('/Trainers/Jane-Doe'))).toBe('/trainers/jane-doe');
  });
});
