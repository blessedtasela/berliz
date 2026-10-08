/**
 * Error reporting (Sentry). Until now an error in someone's browser was a console line nobody saw.
 *
 * Off by default: with an empty `sentryDsn` in the environment file nothing is loaded or sent, and the
 * SDK is imported lazily only when a DSN exists, so it adds nothing to the main bundle otherwise.
 * (A Sentry DSN is a public identifier, not a secret -- it is safe to commit. Personal data such as IP
 * addresses is not attached: that is Sentry's default and nothing here turns it on.)
 */
interface Reporter {
  captureException(error: unknown): void;
}

let reporter: Reporter | null = null;

export function initErrorReporting(opts: { dsn?: string; release: string; environment: string }): void {
  if (!opts.dsn) return;
  import('@sentry/browser')
    .then(sentry => {
      sentry.init({
        dsn: opts.dsn,
        release: opts.release,
        environment: opts.environment,
        tracesSampleRate: 0,
        // Not bugs we can fix: stale-deploy chunk errors are handled by a reload (see GlobalErrorHandlerService),
        // and extension/ad-blocker noise is out of our hands.
        ignoreErrors: [/Loading chunk/i, /ChunkLoadError/i, /dynamically imported module/i, /ResizeObserver loop/i],
        denyUrls: [/extensions\//i, /^chrome:\/\//i, /^moz-extension:\/\//i],
      });
      reporter = sentry;
    })
    .catch(() => { /* reporting must never break the app */ });
}

/** Sends an unexpected error to Sentry when it is enabled; a no-op otherwise. Never throws. */
export function reportError(error: unknown): void {
  try {
    reporter?.captureException(error);
  } catch {
    /* ignore */
  }
}

/** Test seam: lets a spec observe what would be reported without loading the SDK. */
export function setReporterForTests(r: Reporter | null): void {
  reporter = r;
}
