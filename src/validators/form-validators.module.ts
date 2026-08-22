import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { SnackBarService } from 'src/app/services/snack-bar.service';

// Previously rejected any email whose TLD wasn't in a hardcoded allow-list (every
// caller passed only ['com', 'org']), which blocked valid .net/.io/.co/country-code
// etc. addresses. Real TLD validity is already covered by Validators.email, so this
// no longer restricts by extension — kept as a no-op so existing call sites don't
// need to change.
export function emailExtensionValidator(_validExtensions: string[]): ValidatorFn {
  return (_control: AbstractControl) => null;
}

export function fileValidator(control: AbstractControl): ValidationErrors | null {
  const fileInput = control.value;
  if (!fileInput) return null;

  const file = fileInput instanceof File ? fileInput : fileInput?.[0];
  if (!file) return null;

  const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSizeInBytes) {
    return { invalidSize: true };
  }

  return null;
}

export function imageValidator(
  maxSizeInMB: number = 5
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value;

    if (!file) return null; // Required validator will catch empty

    // If coming from file input, it could be a FileList or File
    const selectedFile = file instanceof File ? file : file?.[0];

    if (!selectedFile) return null;

    // File type check — accept any image format, not just a hardcoded allow-list
    if (!selectedFile.type.startsWith('image/')) {
      return { invalidType: true };
    }

    // File size check (convert bytes to MB)
    const maxSizeBytes = maxSizeInMB * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      return { fileTooLarge: true };
    }

    return null;
  };
}

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value || control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (password === confirmPassword) {
    return null; // Passwords match
  }

  return { passwordMismatch: true }; // Passwords don't match
}

export function dataURItoBlob(dataURI: string): Blob {
  if (!dataURI || typeof dataURI !== 'string' || !dataURI.startsWith('data:image')) {
    throw new Error('Invalid dataURI');
  }

  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

export function minArrayLength(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control || !control.value || !Array.isArray(control.value)) {
      return null;
    }
    return control.value.length >= min ? null : { minArrayLength: true };
  };
}


export const videoSizeValidator = (videoFile: File): { [key: string]: any } | null => {
  const maxSizeInMB = 20;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (videoFile.size > maxSizeInBytes) {
    // Return an object with the error key and message (Angular style)
    return { videoSizeError: `Video size exceeds ${maxSizeInMB} MB. Please upload a smaller video.` };

  }

  return null;  // File size is valid
};

export function fullNameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value?.trim();

    if (!value) {
      return { fullNameInvalid: 'Name is required' };
    }

    const names = value.split(' ').filter((n: string) => n); // Filter out empty segments

    if (names.length < 2) {

      return { fullNameInvalid: 'Please enter at least two names' };

    }

    const invalidName = names.find((n: string) => n.length < 3);
    if (invalidName) {
      return { fullNameInvalid: 'Each name must be at least 3 characters long' };
    }

    return null;
  };
}


export const genericError = "Something went wrong on our end — give it another shot.";

export const UNAUTHORIZED = "You don't have access to this page.";

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class FormValidatorsModule { }
