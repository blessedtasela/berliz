import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { SnackBarService } from 'src/app/services/snack-bar.service';

export function emailExtensionValidator(validExtensions: string[]): ValidatorFn {
  return (control: AbstractControl) => {
    const email = control.value;
    if (email) {
      const emailParts = email.split('@');
      if (emailParts.length === 2) {
        const [, domain] = emailParts;
        const domainParts = domain.split('.');
        const extension = domainParts[domainParts.length - 1];
        if (!validExtensions.includes(extension.toLowerCase())) {
          return { invalidExtension: true };
        }
      }
    }
    return null;
  };
}

/**
 * Generic file-size validator (any file type — resumes, certifications, etc;
 * use imageValidator() instead when the type also needs restricting to images).
 * Previously compared against a 50-BYTE threshold (not 50MB) and wrapped the
 * value in `new File([fileInput], 'pdf-file')`, which — combined with the
 * threshold — meant literally any real file always failed as "too large".
 */
export function fileValidator(control: AbstractControl): ValidationErrors | null {
  const fileInput = control.value;
  if (!fileInput) return null; // Required validator will catch empty

  // If coming from a file input, it could be a FileList or a bare File.
  const selectedFile = fileInput instanceof File ? fileInput : fileInput?.[0];
  if (!selectedFile) return null;

  const maxSizeInMB = 10;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (selectedFile.size > maxSizeInBytes) {
    return { fileTooLarge: true };
  }

  return null;
}

export function imageValidator(
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  maxSizeInMB: number = 5
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value;

    if (!file) return null; // Required validator will catch empty

    // If coming from file input, it could be a FileList or File
    const selectedFile = file instanceof File ? file : file?.[0];

    if (!selectedFile) return null;

    // File type check
    if (!allowedTypes.includes(selectedFile.type)) {
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

/** Rejects a date-of-birth control value that is younger than `minAge` years old as of today. */
export function minimumAgeValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null; // Required validator will catch empty

    const dob = new Date(value);
    if (isNaN(dob.getTime())) return null; // not our job to validate format

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const hasHadBirthdayThisYear =
      today.getMonth() > dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
    if (!hasHadBirthdayThisYear) age--;

    return age >= minAge ? null : { underAge: { requiredAge: minAge, actualAge: age } };
  };
}

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
