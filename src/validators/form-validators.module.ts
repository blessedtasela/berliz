import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { SnackBarService } from 'src/app/services/snack-bar.service';

export function  emailExtensionValidator(validExtensions: string[]): ValidatorFn {
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
export function  fileValidator(control: AbstractControl): ValidationErrors | null {
  const file = control.value;
  if (file) {
    console.log(file)
    console.log(typeof file.name)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      console.log('Max size exceeded. Allowed size << 5mb');
      return { invalidSize: true };
    }
  }
  return null;
}

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value || control.get('newPassword')?.value ;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (password === confirmPassword) {
    return null; // Passwords match
  }
  
  return { passwordMismatch: true }; // Passwords don't match
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
