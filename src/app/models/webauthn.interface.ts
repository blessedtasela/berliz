// Shapes mirror the backend /webauthn contract, wrapped in ApiResponse<T>
// (see models/Api.interface.ts). See services/webauthn.service.ts for the
// actual navigator.credentials.create()/get() ceremony these feed into.

export interface WebAuthnRegisterOptionsResponse {
    challenge: string; // base64url
    rpId: string;
    rpName: string;
    userId: string; // base64url
    userEmail: string;
    userDisplayName: string;
    excludeCredentialIds: string[]; // base64url
    timeoutMs: number;
}

export interface WebAuthnLoginOptionsResponse {
    challenge: string; // base64url
    rpId: string;
    timeoutMs: number;
}

/** One registered passkey, as listed in Settings — never carries the actual credential material. */
export interface WebAuthnCredentialResponse {
    id: number;
    label: string;
    transports: string | null;
    date: Date;
    lastUsedAt: Date;
    message?: string;
}
