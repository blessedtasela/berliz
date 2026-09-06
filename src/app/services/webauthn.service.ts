import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

import { ApiResponse } from '../models/Api.interface';
import { AuthResponse } from '../models/Auth.interface';
import {
  WebAuthnCredentialResponse,
  WebAuthnLoginOptionsResponse,
  WebAuthnRegisterOptionsResponse,
} from '../models/webauthn.interface';

/**
 * Passkeys (WebAuthn/FIDO2) — wraps both the HTTP calls to /webauthn/* and
 * the actual browser ceremony (navigator.credentials.create()/get()),
 * including the base64url <-> ArrayBuffer conversion WebAuthn's binary
 * fields need that JSON can't carry directly.
 *
 * The credential *response* (what the authenticator hands back) is
 * serialized via the credential's own `.toJSON()` — the standard, spec-
 * defined shape webauthn4j's JSON parser expects — with a manual fallback
 * for the rare browser that supports WebAuthn but predates `toJSON()`
 * (added to the spec after the base API already shipped everywhere).
 */
@Injectable({
  providedIn: 'root'
})
export class WebAuthnService {

  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  // ── Feature detection ───────────────────────────────────────────────────

  get isSupported(): boolean {
    return typeof window !== 'undefined' && !!(window as any).PublicKeyCredential;
  }

  /** True if THIS device has a platform authenticator (Face ID/Touch ID/Windows Hello) available right now. */
  async isPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (!this.isSupported) return false;
    try {
      return await (window as any).PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }

  // ── Registration (adding a passkey to an already-signed-in account) ────

  private getRegisterOptions() {
    return this.httpClient.get<ApiResponse<WebAuthnRegisterOptionsResponse>>(`${this.url}/webauthn/registerOptions`);
  }

  private completeRegistration(credentialJSON: string, label: string) {
    return this.httpClient.post<ApiResponse<WebAuthnCredentialResponse>>(`${this.url}/webauthn/registerComplete`, {
      credentialJSON, label,
    });
  }

  getMyCredentials() {
    return this.httpClient.get<ApiResponse<WebAuthnCredentialResponse[]>>(`${this.url}/webauthn/getMyCredentials`);
  }

  deleteCredential(id: number) {
    return this.httpClient.delete<ApiResponse<any>>(`${this.url}/webauthn/credential/${id}`);
  }

  /** Full ceremony: fetch options, prompt Face ID/Touch ID/Windows Hello, save the result. */
  async registerPasskey(label: string): Promise<WebAuthnCredentialResponse> {
    if (!this.isSupported) throw new Error('Passkeys are not supported on this browser.');

    const optionsRes = await firstValueFrom(this.getRegisterOptions());
    const options = optionsRes?.data;
    if (!options) throw new Error(optionsRes?.message || 'Could not start passkey setup.');

    const publicKey: CredentialCreationOptions['publicKey'] = {
      challenge: base64UrlToBuffer(options.challenge),
      rp: { id: options.rpId, name: options.rpName },
      user: {
        id: base64UrlToBuffer(options.userId),
        name: options.userEmail,
        displayName: options.userDisplayName,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },   // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      excludeCredentials: (options.excludeCredentialIds || []).map(id => ({
        type: 'public-key', id: base64UrlToBuffer(id),
      })),
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'required',
        userVerification: 'required',
      },
      attestation: 'none',
      timeout: options.timeoutMs,
    };

    const credential = await navigator.credentials.create({ publicKey }) as PublicKeyCredential | null;
    if (!credential) throw new Error('Passkey setup was cancelled.');

    const credentialJSON = JSON.stringify(credentialToJSON(credential));
    const res = await firstValueFrom(this.completeRegistration(credentialJSON, label));
    if (!res?.data?.id) throw new Error(res?.message || 'Could not save this passkey.');
    return res.data;
  }

  // ── Login (usernameless — the browser's own picker chooses the credential) ──

  private getLoginOptions() {
    return this.httpClient.get<ApiResponse<WebAuthnLoginOptionsResponse>>(`${this.url}/webauthn/loginOptions`);
  }

  private completeLogin(credentialJSON: string) {
    return this.httpClient.post<ApiResponse<AuthResponse>>(`${this.url}/webauthn/loginComplete`, { credentialJSON });
  }

  /** Full ceremony: fetch options, prompt for the passkey, verify — returns the same ApiResponse<AuthResponse> shape as password login. */
  async loginWithPasskey(): Promise<ApiResponse<AuthResponse>> {
    if (!this.isSupported) throw new Error('Passkeys are not supported on this browser.');

    const optionsRes = await firstValueFrom(this.getLoginOptions());
    const options = optionsRes?.data;
    if (!options) throw new Error(optionsRes?.message || 'Could not start passkey login.');

    const publicKey: CredentialRequestOptions['publicKey'] = {
      challenge: base64UrlToBuffer(options.challenge),
      rpId: options.rpId,
      userVerification: 'required',
      timeout: options.timeoutMs,
    };

    const credential = await navigator.credentials.get({ publicKey }) as PublicKeyCredential | null;
    if (!credential) throw new Error('Passkey login was cancelled.');

    const credentialJSON = JSON.stringify(credentialToJSON(credential));
    return firstValueFrom(this.completeLogin(credentialJSON));
  }
}

// ── Encoding helpers ───────────────────────────────────────────────────────

function base64UrlToBuffer(base64url: string): ArrayBuffer {
  const padded = base64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(base64url.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Prefers the credential's own `.toJSON()` (spec-standard shape, added after
 * WebAuthn's base API already shipped everywhere) and falls back to building
 * the same shape by hand for the rare browser that lacks it.
 */
function credentialToJSON(credential: PublicKeyCredential): unknown {
  if (typeof (credential as any).toJSON === 'function') {
    return (credential as any).toJSON();
  }

  const response = credential.response as AuthenticatorAttestationResponse & AuthenticatorAssertionResponse;
  const isRegistration = typeof (response as AuthenticatorAttestationResponse).attestationObject !== 'undefined';

  const base: any = {
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    type: credential.type,
    clientExtensionResults: credential.getClientExtensionResults?.() ?? {},
  };

  if (isRegistration) {
    base.response = {
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      attestationObject: bufferToBase64Url((response as AuthenticatorAttestationResponse).attestationObject),
      transports: (response as AuthenticatorAttestationResponse).getTransports?.() ?? [],
    };
  } else {
    base.response = {
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      authenticatorData: bufferToBase64Url((response as AuthenticatorAssertionResponse).authenticatorData),
      signature: bufferToBase64Url((response as AuthenticatorAssertionResponse).signature),
      userHandle: (response as AuthenticatorAssertionResponse).userHandle
        ? bufferToBase64Url((response as AuthenticatorAssertionResponse).userHandle as ArrayBuffer)
        : null,
    };
  }

  return base;
}
