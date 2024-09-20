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

export function fileValidator(control: AbstractControl): ValidationErrors | null {
  const fileInput = control.value;
  if (!fileInput || fileInput.length === 0) {
    return null;
  }

  const file = new File([fileInput], 'pdf-file');
  const maxSizeInBytes = 50; // 50
  console.log(file, ' file')
  console.log(file.size, ' file size')
  if (file.size < maxSizeInBytes) {
    console.log('invalid is false. inside if block')
    return null;
  }

  console.log('invalid is true')
  // File size exceeds limit, return validation error
  return { invalidSize: true };
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



export const genericError = "An error occured while connecting to the server";

export const UNAUTHORIZED = "You are not authorized to access this page!";

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class FormValidatorsModule { }
