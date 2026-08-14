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
   * with the raw ID token (JWT) once the user completes the Google flow — hand it
   * straight to `UserService.loginWithGoogle`.
   *
   * Rejects (without touching the DOM) if `environment.googleClientId` is still empty —
   * callers should catch this and fall back to their own "not configured yet" UI.
   */
  async renderGoogleButton(elementId: string, onCredential: (idToken: string) => void): Promise<void> {
    if (!this.isGoogleConfigured) {
      throw new Error('Google Sign-In is not configured yet.');
    }

    await this.loadGoogleScript();

    const el = document.getElementById(elementId);
    if (!el) {
      return;
    }

    const google = getGoogle();
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: { credential: string }) => onCredential(response.credential),
      auto_select: false,
    });

    // type: 'icon' renders a compact circular icon button, matching the square
    // icon-button styling the rest of the social-login row already uses.
    google.accounts.id.renderButton(el, {
      type: 'icon',
      shape: 'circle',
      theme: 'outline',
      size: 'large',
    });
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
      }, { scope: 'email,public_profile' });
    });
  }
}
