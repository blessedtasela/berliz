import { initErrorReporting, reportError, setReporterForTests } from './error-reporting';

describe('error reporting', () => {
  afterEach(() => setReporterForTests(null));

  it('is a silent no-op until a DSN is configured', () => {
    expect(() => initErrorReporting({ dsn: '', release: 'berliz-web@test', environment: 'test' })).not.toThrow();
    expect(() => reportError(new Error('nobody is listening'))).not.toThrow();
  });

  it('hands an unexpected error to the reporter when one is active', () => {
    const seen: unknown[] = [];
    setReporterForTests({ captureException: e => { seen.push(e); } });
    const boom = new Error('boom');

    reportError(boom);

    expect(seen).toEqual([boom]);
  });

  it('never lets a failing reporter break the app', () => {
    setReporterForTests({ captureException: () => { throw new Error('reporter down'); } });

    expect(() => reportError(new Error('x'))).not.toThrow();
  });
});
