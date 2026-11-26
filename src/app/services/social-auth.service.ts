import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

// google/FB are loaded dynamically at runtime from https://accounts.google.com/gsi/client
// and https://connect.facebook.net/en_US/sdk.js — there's no @types package for either, and
// no ambient global declared for them elsewhere in this project, so they're read off
// `window` (typed loosely as `any`) rather than referenced as bare identifiers.
function getGoogle(): any {
  return (window as any).google;
}

function getFB(): any {
  return (window as any).FB;
}

/**
 * Browser-side glue for "Sign in with Google" (Google Identity Services — the current,
 * non-deprecated library, NOT the old gapi.auth2) and Facebook Login (Facebook JS SDK).
 *
 * This service only ever hands back a raw provider token (Google ID token / Facebook
 * user access token) obtained client-side. It never talks to the Berliz backend itself —
 * callers POST the token to UserService.loginWithGoogle/loginWithFacebook, which is
 * where server-side verification actually happens. A token obtained here proves nothing
 * on its own.
 */
@Injectable({
  providedIn: 'root'
})
export class SocialAuthService {

  private googleScriptPromise: Promise<void> | null = null;
  private facebookScriptPromise: Promise<void> | null = null;

  // google.accounts.id.initialize() must only ever run once per page session --
  // calling it again (which used to happen every time renderGoogleButton() ran,
  // i.e. every time a login/signup component remounted, e.g. navigating away
  // from and back to /login within the SPA) re-registers the credential
  // listener on top of the previous one. This service is providedIn: 'root',
  // so this flag is a true once-per-session guard shared by every caller.
  private googleInitialized = false;
  private currentGoogleCredentialHandler: ((idToken: string) => void) | null = null;

  get isGoogleConfigured(): boolean {
    return !!environment.googleClientId;
  }

  get isFacebookConfigured(): boolean {
    return !!environment.facebookAppId;
  }

  /** Loads https://accounts.google.com/gsi/client once and caches the promise. */
  private loadGoogleScript(): Promise<void> {
    if (this.googleScriptPromise) {
      return this.googleScriptPromise;
    }

    this.googleScriptPromise = new Promise<void>((resolve, reject) => {
      if (getGoogle()?.accounts?.id) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });

    return this.googleScriptPromise;
  }

  /**
   * Initializes Google Identity Services and renders the official "Sign in with
   * Google" button inside the element with the given id. `onCredential` is invoked
   * with the raw ID token (JWT) once the user completes the Google flow via the
   * lightweight FedCM/One Tap path — hand it straight to `UserService.loginWithGoogle`.
   *
   * `ux_mode: 'redirect'` covers the FALLBACK path (FedCM unavailable): Google's rendered
   * button lives in a cross-origin iframe, and when it falls back from FedCM to a popup,
   * that popup opens FROM INSIDE that iframe -- Safari's Intelligent Tracking Prevention
   * silently blocks it even for a direct tap, and the same is true of essentially every
   * in-app WebView (which is exactly what this page is, for the mobile hand-off -- see
   * LoginFormComponent). Redirect mode has no popup at all: a full top-level navigation to
   * Google, then Google POSTs the result to `login_uri` (SocialAuthRest#googleRedirectCallback)
   * as a plain form, not back to this page's JS -- that backend endpoint redirects to
   * /login with the resulting tokens in the query string, the same shape completeAuth()
   * already uses for the mobile hand-off. `onCredential` (and therefore the FedCM/One Tap
   * success path) is unaffected; this only changes what happens when that path isn't usable.
   *
   * `mobileRedirect`: appended to `login_uri` so the backend callback can hand the tokens
   * straight to the mobile app instead of landing on the web `/login` page -- see that
   * endpoint's own doc comment for the matching server-side validation (SG-08).
   *
   * Rejects (without touching the DOM) if `environment.googleClientId` is still empty —
   * callers should catch this and fall back to their own "not configured yet" UI.
   */
  async renderGoogleButton(elementId: string, onCredential: (idToken: string) => void, mobileRedirect?: string | null): Promise<void> {
    if (!this.isGoogleConfigured) {
      throw new Error('Google Sign-In is not configured yet.');
    }

    await this.loadGoogleScript();

    const el = document.getElementById(elementId);
    if (!el) {
      return;
    }

    // The latest caller always wins the actual credential callback, even
    // though initialize() below only ever runs its first time.
    this.currentGoogleCredentialHandler = onCredential;

    const google = getGoogle();

    if (!this.googleInitialized) {
      this.googleInitialized = true;
      let loginUri = `${environment.api}/auth/google/redirect-callback`;
      if (mobileRedirect) {
        loginUri += `?mobileRedirect=${encodeURIComponent(mobileRedirect)}`;
      }
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: { credential: string }) =>
          this.currentGoogleCredentialHandler?.(response.credential),
        auto_select: false,
        ux_mode: 'redirect',
        login_uri: loginUri,
      });
    }

    // renderButton() IS safe (and required) to call every time this method
    // runs — it just (re)paints the button into whichever element id was
    // passed this time. Only initialize() above needed the once-only guard.
    // type: 'icon' + shape: 'square' renders a compact rounded-square icon
    // button, matching the Facebook button's w-11 h-11 rounded-xl styling
    // right next to it — 'circle' left a mismatched round shape clipped
    // inside that square container.
    google.accounts.id.renderButton(el, {
      type: 'icon',
      shape: 'square',
      theme: 'outline',
      size: 'large',
    });
  }

  /**
   * Kicks off loading the Facebook SDK ahead of time (call this on page load, not
   * on click). FB.login() must run synchronously inside the click handler for its
   * popup to actually behave like a popup — mobile browsers (Safari especially)
   * require that direct user-gesture chain, and break it the moment there's an
   * `await` for a script that hasn't loaded yet. The visible symptom is the login
   * silently falling back to opening in a new tab instead of a popup that reports
   * back. Preloading here means the SDK is (almost always, in practice) already
   * loaded by the time the user actually taps the button, so loginWithFacebook()'s
   * own await resolves immediately instead of introducing that gap. Errors are
   * swallowed — isFacebookConfigured/loadFacebookScript's own rejection still
   * surfaces normally at actual click time.
   */
  preloadFacebookSdk(): void {
    this.loadFacebookScript().catch(() => { /* surfaced for real on click, not here */ });
  }

  /** Loads the Facebook JS SDK once and initializes FB.init() with our App ID. */
  private loadFacebookScript(): Promise<void> {
    if (this.facebookScriptPromise) {
      return this.facebookScriptPromise;
    }

    if (!this.isFacebookConfigured) {
      return Promise.reject(new Error('Facebook Login is not configured yet.'));
    }

    this.facebookScriptPromise = new Promise<void>((resolve, reject) => {
      if (getFB()) {
        resolve();
        return;
      }

      (window as any).fbAsyncInit = () => {
        getFB().init({
          appId: environment.facebookAppId,
          cookie: true,
          xfbml: false,
          version: 'v19.0',
        });
        resolve();
      };

      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.onerror = () => reject(new Error('Failed to load the Facebook SDK'));
      document.head.appendChild(script);
    });

    return this.facebookScriptPromise;
  }

  /**
   * Opens the Facebook login popup and resolves with the user access token. Rejects if
   * Facebook Login isn't configured yet, the SDK fails to load, or the user cancels /
   * declines the permission request.
   */
  async loginWithFacebook(): Promise<string> {
    await this.loadFacebookScript();

    return new Promise<string>((resolve, reject) => {
      getFB().login((response: any) => {
        const accessToken = response?.authResponse?.accessToken;
        if (accessToken) {
          resolve(accessToken);
        } else {
          reject(new Error('Facebook login was cancelled or not authorized.'));
        }
        // user_birthday backs the backend's best-effort under-16 check on new social
        // signups (see SocialAuthServiceImplement.loginOrCreate). It needs Meta App
        // Review to actually return data for real (non-tester) users — until that's
        // approved, Facebook silently omits it and the backend skips the check rather
        // than blocking signup, so this is safe to request either way.
      }, { scope: 'email,public_profile,user_birthday' });
    });
  }
}
