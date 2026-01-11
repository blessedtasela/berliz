import { Injectable } from '@angular/core';
import { parsePhoneNumberFromString, AsYouType, CountryCode } from 'libphonenumber-js';
import { postcodeValidator } from "postcode-validator";

@Injectable({ providedIn: 'root' })
export class LocationFormatterService {

  /** ---------------- Postal Code ---------------- */
  validatePostalCode(postal: string, countryIso: string): boolean {
    if (!postal || !countryIso) return false;
    try {
      return postcodeValidator(postal, countryIso.toUpperCase());
    } catch {
      return false;
    }
  }

  /** ---------------- Phone ---------------- */
  formatPhone(phone: string, countryIso: string): string {
    if (!phone || !countryIso) return phone;
    try {
      return new AsYouType(countryIso as CountryCode).input(phone);
    } catch {
      return phone;
    }
  }

  validatePhone(phone: string, countryIso: string): boolean {
    if (!phone || !countryIso) return false;
    try {
      const parsed = parsePhoneNumberFromString(phone, countryIso as CountryCode);
      return parsed?.isValid() ?? false;
    } catch {
      return false;
    }
  }

  getExamplePhone(countryIso: string): string {
    if (!countryIso) return '';
    try {
      const parsed = parsePhoneNumberFromString('', countryIso as CountryCode);
      return parsed?.formatInternational() ?? '';
    } catch {
      return '';
    }
  }

  /** ---------------- Address ---------------- */
  formatAddress(address: string): string {
    if (!address) return '';
    return address
      .replace(/\s+/g, ' ') // remove extra spaces
      .trim()
      .replace(/\b\w/g, c => c.toUpperCase()); // capitalize first letters
  }

  validateAddress(address: string, minLength = 5): boolean {
    if (!address) return false;
    const regex = /^[a-zA-Z0-9\s,.'-]{3,}$/;
    return regex.test(address.trim());
  }
}
