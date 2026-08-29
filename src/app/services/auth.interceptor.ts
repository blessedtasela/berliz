import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';

import { BehaviorSubject, Observable, Subject, merge, throwError, TimeoutError } from 'rxjs';
import { catchError, filter, map, switchMap, take, timeout } from 'rxjs/operators';

import { Router } from '@angular/router';
import { UserService } from './user.service';
import { AuthService } from './auth.service';

/**
 * Result of the single shared refresh attempt, as observed by the requests that
 * were queued behind it. Either we got a fresh access token (retry with it), or
 * the refresh failed (fail the queued request too — never leave it hanging).
 */
type RefreshOutcome =
  | { ok: true; token: string }
  | { ok: false; error: unknown };

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  /**
   * True while exactly one refresh HTTP call is in flight. Any 401 that arrives
   * while this is true must NOT start a second refresh — it queues instead.
   */
  private refreshInProgress = false;

  /**
   * Carries the new access token to every request queued behind the in-flight
   * refresh. Reset to `null` at the start of each refresh cycle so that a queued
   * request can never be released with a stale token from a previous cycle.
   */
  private refreshedToken$ = new BehaviorSubject<string | null>(null);

  /** Carries a refresh failure to the queued requests so they don't hang forever. */
  private refreshFailed$ = new Subject<unknown>();

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) { }

  private isPublicRequest(url: string): boolean {
    const publicEndpoints = [
      '/user/login',
      '/user/signup',
      '/user/refreshToken',
      '/user/forgotPassword',
      '/user/resetPassword',
      '/user/activateAccount',
      '/user/checkToken',
      '/newsletter/',
      '/contactUs/',
      '/static/',
      '/images/',
      '/videos/',
      '/public/',
      '/stomp'
    ];

    return publicEndpoints.some(route => url.includes(route));
  }

  private withToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * How long to wait for a response before treating the backend as unreachable.
   * Without this, an unresponsive/down server relies on the browser's own default
   * connection timeout (60s+) before anything errors out — which just looks like
   * an infinite spinner to the user. Uploads get more room since a slow connection
   * legitimately needs longer to push a large file, not because the server's down.
   */
  private readonly DEFAULT_TIMEOUT_MS = 20000;
  private readonly UPLOAD_TIMEOUT_MS = 90000;

  private timeoutFor(url: string): number {
    return url.includes('/strapi/upload') ? this.UPLOAD_TIMEOUT_MS : this.DEFAULT_TIMEOUT_MS;
  }

  /** Reshapes a timeout into the same {error: {message}} shape backend error
   * responses already have, so existing `error.error?.message` handlers in
   * components show this instead of silently falling through to a generic
   * message with no explanation. Not applied to the WebSocket/STOMP handshake —
   * that connection is meant to stay open, not resolve quickly. */
  private withTimeout<T>(source: Observable<T>, url: string): Observable<T> {
    if (url.includes('/stomp')) {
      return source;
    }
    return source.pipe(
      timeout(this.timeoutFor(url)),
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(() => ({
            status: 0,
            error: { message: 'The server is taking too long to respond. Please check your connection and try again.' }
          }));
        }
        return throwError(() => err);
      })
    );
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = this.authService.getToken();

    if (this.isPublicRequest(request.url) || !token) {
      return this.withTimeout(next.handle(request), request.url);
    }

    return this.withTimeout(next.handle(this.withToken(request, token)), request.url).pipe(
      catchError((error: HttpErrorResponse) => {

        // 401 handling
        if (error.status === 401) {

          const msg = (error.error?.message || '').toLowerCase();

          const isTokenExpired =
            msg.includes('jwt expired') ||
            msg.includes('token expired') ||
            msg.includes('refresh token expired');

          // only here we try refresh / logout
          if (isTokenExpired) {
            return this.handleExpiredToken(request, next, error);
          }

          // not a token problem -> do NOT logout, just bubble error
          return throwError(() => error);
        }

        // 403 -> forbidden, but no logout
        if (error.status === 403) {
          this.router.navigate(['/dashboard']);
          return throwError(() => error);
        }

        // all other errors: just bubble
        return throwError(() => error);
      })
    );
  }

  /**
   * A request came back 401 "token expired".
   *
   * Pages in this app routinely fire 2-4 requests at once on `ngOnInit`, so when
   * the access token expires several requests hit 401 within milliseconds of
   * each other. Without de-duplication each one would fire its own
   * `/user/refreshToken` call: the backend rotates the refresh token on every
   * successful call, so the parallel calls race to overwrite `refresh_token` in
   * localStorage, and any call that loses the race (or that runs against a token
   * the server has already rotated past) fails -> hard logout, caused purely by
   * timing.
   *
   * So: the FIRST 401 performs the refresh; every other 401 queues on
   * `refreshedToken$` / `refreshFailed$` and is retried (or failed) with the
   * outcome of that single call.
   */
  private handleExpiredToken(
    request: HttpRequest<any>,
    next: HttpHandler,
    originalError: HttpErrorResponse
  ): Observable<HttpEvent<any>> {

    if (this.refreshInProgress) {
      return this.queueUntilRefreshResolves(request, next);
    }

    const refreshToken = this.authService.getRefreshToken();

    if (!refreshToken) {
      this.forceLogout();
      return throwError(() => originalError);
    }

    // Open a new refresh cycle. Clearing the subject first is what guarantees a
    // queued request can never be released with the token of a previous cycle.
    this.refreshInProgress = true;
    this.refreshedToken$.next(null);

    return this.userService.refreshToken({ token: refreshToken }).pipe(
      switchMap(response => {
        const auth = response?.data;
        const accessToken = auth?.accessToken;
        const newRefreshToken = auth?.refreshToken;

        // The backend answers 200 with null tokens + a message when the refresh
        // token is rejected, so a successful HTTP call is not by itself proof of
        // a successful refresh. Treat a missing access token as a failure rather
        // than storing `undefined` and silently killing the session.
        if (!accessToken) {
          return throwError(() => originalError);
        }

        localStorage.setItem('token', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        // Release everyone queued behind this call before we retry our own
        // request, so all of them go out with the same fresh token.
        this.refreshInProgress = false;
        this.refreshedToken$.next(accessToken);

        return next.handle(this.withToken(request, accessToken));
      }),
      catchError(refreshError => {
        // Unrecoverable: tell the queued requests so they fail fast instead of
        // waiting on a token that will never arrive, and only then log out.
        this.refreshInProgress = false;
        this.refreshFailed$.next(refreshError);

        this.forceLogout();
        return throwError(() => refreshError);
      })
    );
  }

  /**
   * Park this request until the in-flight refresh resolves, then replay it with
   * the new token. If the refresh fails instead, the request fails with that
   * error — whichever of the two subjects speaks first wins, so a queued request
   * always terminates.
   */
  private queueUntilRefreshResolves(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    const success$ = this.refreshedToken$.pipe(
      filter((token): token is string => token !== null),
      map((token): RefreshOutcome => ({ ok: true, token }))
    );

    const failure$ = this.refreshFailed$.pipe(
      map((error): RefreshOutcome => ({ ok: false, error }))
    );

    return merge(success$, failure$).pipe(
      take(1),
      switchMap(outcome =>
        outcome.ok
          ? next.handle(this.withToken(request, outcome.token))
          : throwError(() => outcome.error)
      )
    );
  }

  /**
   * The one and only hard-logout path in the interceptor.
   * `AuthService.logout()` clears the tokens and navigates to `/login`,
   * carrying the page the user was on as returnUrl (via AuthRedirectService)
   * so they land back here once they sign back in. Don't navigate again
   * here -- a second bare `/login` would immediately overwrite that returnUrl.
   */
  private forceLogout(): void {
    this.authService.logout();
  }
}
