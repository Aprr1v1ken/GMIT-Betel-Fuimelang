import type { User } from '../types/index.ts';

const WEBAUTHN_STORAGE_KEY = 'sysjeger_biometric_credential';

export interface StoredBiometricCredential {
  credentialId: string;
  username: string;
  user: User;
  registeredAt: string;
}

// Convert string to Uint8Array
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Convert ArrayBuffer to Base64URL
function bufferToBase64URL(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Convert Base64URL to Uint8Array
function base64URLToUint8Array(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Check if WebAuthn API is supported in the browser
export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext !== false &&
    typeof window.PublicKeyCredential !== 'undefined' &&
    typeof navigator.credentials !== 'undefined'
  );
}

// Check if Platform Authenticator (Fingerprint, TouchID, FaceID, Windows Hello) is available
export async function isPlatformBiometricAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;
  try {
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return true;
  } catch (err) {
    console.warn('Error checking platform authenticator availability:', err);
    return false;
  }
}

// Get currently registered biometric credentials from localStorage
export function getRegisteredBiometricCredential(): StoredBiometricCredential | null {
  try {
    const raw = localStorage.getItem(WEBAUTHN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('Error loading biometric credential from storage:', err);
    return null;
  }
}

// Remove registered biometric credential
export function clearRegisteredBiometricCredential(): void {
  try {
    localStorage.removeItem(WEBAUTHN_STORAGE_KEY);
  } catch (err) {
    console.warn('Error clearing biometric credential:', err);
  }
}

// Register a biometric credential for the church staff user
export async function registerBiometricCredential(
  user: User
): Promise<{ success: boolean; message: string }> {
  if (!isWebAuthnSupported()) {
    return {
      success: false,
      message: 'Perangkat atau browser ini belum mendukung autentikasi biometrik WebAuthn.',
    };
  }

  try {
    // Generate random 32-byte challenge
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    // User ID buffer
    const userIdBuffer = stringToUint8Array(user.id || user.username);

    const publicKeyOptions: PublicKeyCredentialCreationOptions = {
      challenge: challenge.buffer as ArrayBuffer,
      rp: {
        name: 'SYSJEGER - GMIT Betel Fuimelang',
        id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
      },
      user: {
        id: userIdBuffer as unknown as BufferSource,
        name: user.username,
        displayName: user.name,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
        requireResidentKey: false,
      },
      timeout: 60000,
      attestation: 'none',
    };

    const credential = (await navigator.credentials.create({
      publicKey: publicKeyOptions,
    })) as PublicKeyCredential | null;

    if (!credential) {
      return { success: false, message: 'Pendaftaran biometrik dibatalkan.' };
    }

    const credentialId = bufferToBase64URL(credential.rawId);

    const storedData: StoredBiometricCredential = {
      credentialId,
      username: user.username,
      user,
      registeredAt: new Date().toISOString(),
    };

    localStorage.setItem(WEBAUTHN_STORAGE_KEY, JSON.stringify(storedData));

    return {
      success: true,
      message: `Sidik jari / Face ID berhasil didaftarkan untuk "${user.name}" (${user.role}).`,
    };
  } catch (err: any) {
    console.error('WebAuthn Registration Error:', err);
    if (err.name === 'NotAllowedError') {
      return { success: false, message: 'Pemindaian biometrik dibatalkan atau ditolak.' };
    }
    return {
      success: false,
      message: err.message || 'Gagal mendaftarkan biometrik pada perangkat ini.',
    };
  }
}

// Authenticate church staff using biometric prompt (Fingerprint / Face ID / Windows Hello)
export async function authenticateWithBiometrics(): Promise<{
  success: boolean;
  user?: User;
  message: string;
}> {
  if (!isWebAuthnSupported()) {
    return {
      success: false,
      message: 'Perangkat atau browser ini belum mendukung autentikasi biometrik WebAuthn.',
    };
  }

  const stored = getRegisteredBiometricCredential();
  if (!stored) {
    return {
      success: false,
      message: 'Belum ada sidik jari atau Face ID yang didaftarkan untuk perangkat ini.',
    };
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const allowCredentials: PublicKeyCredentialDescriptor[] = [];
    if (stored.credentialId) {
      try {
        allowCredentials.push({
          id: base64URLToUint8Array(stored.credentialId) as unknown as BufferSource,
          type: 'public-key',
        });
      } catch (e) {
        console.warn('Failed parsing stored credential raw ID:', e);
      }
    }

    const publicKeyOptions: PublicKeyCredentialRequestOptions = {
      challenge: challenge.buffer as ArrayBuffer,
      rpId: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
      allowCredentials,
      userVerification: 'preferred',
      timeout: 60000,
    };

    const assertion = (await navigator.credentials.get({
      publicKey: publicKeyOptions,
    })) as PublicKeyCredential | null;

    if (!assertion) {
      return { success: false, message: 'Verifikasi biometrik dibatalkan.' };
    }

    return {
      success: true,
      user: stored.user,
      message: `Autentikasi sidik jari / Face ID berhasil. Selamat datang, ${stored.user.name}!`,
    };
  } catch (err: any) {
    console.error('WebAuthn Authentication Error:', err);
    if (err.name === 'NotAllowedError') {
      return { success: false, message: 'Verifikasi sidik jari/wajah dibatalkan atau ditolak.' };
    }
    return {
      success: false,
      message: err.message || 'Gagal memverifikasi biometrik perangkat.',
    };
  }
}
