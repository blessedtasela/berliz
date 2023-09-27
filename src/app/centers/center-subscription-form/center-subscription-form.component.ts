import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-center-subscription-form',
  templateUrl: './center-subscription-form.component.html',
  styleUrls: ['./center-subscription-form.component.css']
})
export class CenterSubscriptionFormComponent {

  maxCategories: boolean = false;
  centerSubscriptionForm!: FormGroup;
  invalidForm: boolean = false;

  centerCategories: Array<any> = [
    { name: 'bodyBuilding', value: 'Body Building' },
    { name: 'boxing', value: 'Boxing' },
    { name: 'crossfit', value: 'Cross-fit' },
    { name: 'circuitTraining', value: 'Circuit Training' },
    { name: 'weightLifting', value: 'Weight Lifting' }
  ];


  constructor(private fb: FormBuilder,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.centerSubscriptionForm = this.fb.group({
      'clientId': '1',
      'trainerId': '1',
      'name': ['', Validators.required],
      'plan': ['', Validators.required],
      'categories': new FormArray([], [this.validateCategories(2, 1)]),
      'motivation': ['', Validators.required],
    });
  }

  onCheckboxChange(event: any) {
    const selectedCategories = (this.centerSubscriptionForm.controls['categories'] as FormArray);
    if (event.target.checked) {
      selectedCategories.push(new FormControl(event.target.value));
    } else {
      const index = selectedCategories.controls
        .findIndex(x => x.value === event.target.value);
      selectedCategories.removeAt(index);
    }
  }

  // Custom validator function to check the number of selected categories
  validateCategories(max: number, min: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const selectedCategories = control.value as string[]; // Assumes the value is an array of strings
      const numSelected = selectedCategories ? selectedCategories.length : 0;

      if (numSelected > max) {
        return { 'maxCategoriesExceeded': true };
      }
      if (numSelected < min) {
        return { 'required': true };
      }
      return null; // Validation passes
    };
  }

  submitForm(): void {
    if (this.centerSubscriptionForm.invalid) {
      this.invalidForm = true
      console.log('please complete all fields');
    }
    else {
      const confirmResult = window.confirm("You are leaving to an external link. Do you want to proceed?");

      if (confirmResult) {
        // redirect client to whatsapp with the inputted data
        const formValue = this.centerSubscriptionForm.value;

        // Format the message to be sent via WhatsApp
        const whatsappMessage = `Hello, I am interested in your gym club.\n`
          + `My name is ${formValue.name}, and I want to subscribe to your service with: ${formValue.plan} plan.\n`
          + `Categories: ${formValue.categories.join(', ')}\n`
          + `Motivation: ${formValue.motivation}`;

        console.log(whatsappMessage);

        // Replace the phone number below with the actual WhatsApp phone number you want to contact
        const phoneNumber = '+212610310304';

        // Create the WhatsApp URL with the message as a query parameter
        const whatsappURL = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(whatsappMessage)}`;

        this.centerSubscriptionForm.reset();
        // Redirect the user to the WhatsApp URL
        window.location.href = whatsappURL;
        
      }
      else {

      }

      /*
 const currentDate = new Date().toISOString().split('T')[0];
 const formValue = {
   ...this.centerSubscriptionForm.value,
   date: currentDate
 };

 this.jsonApiService
   .addTrainerClientSubscription(formValue)
   .subscribe(res => {
     console.log('You submitted:', res);
   });

 alert('You have sucessfully subscribed. Get ready to transform your life.');
 this.centerSubscriptionForm.reset();
 this.invalidForm = false;
 this.router.navigate(['/dashboard']);
 window.scrollTo({ top: 0, behavior: 'smooth' });
 */

    }
  }
}
