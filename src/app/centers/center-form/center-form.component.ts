import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-center-form',
  templateUrl: './center-form.component.html',
  styleUrls: ['./center-form.component.css']
})
export class CenterFormComponent {
  centerForm: FormGroup;
  invalidForm: boolean = false;

  constructor(fb: FormBuilder){
    this.centerForm = fb.group({
      'name': ['', [Validators.required, Validators.minLength(6)]],
      'facebookUrl': ['', [Validators.pattern('^(https?:\\/\\/)?(www\\.)?facebook\\.com\\/.+$')]],
      'instagramUrl': ['', [Validators.required, Validators.pattern('^(https?:\\/\\/)?(www\\.)?instagram\\.com\\/.+$')]],
      'twitterUrl': ['', [Validators.pattern('^(https?:\\/\\/)?(www\\.)?twitter\\.com\\/.+$')]],
      'motivation': ['']
    });
  }

  submitForm(): boolean{
    if (this.centerForm.invalid) {
      console.log('Invalid form');
      this.invalidForm = true;
    } else {
      const confirmResult = window.confirm("You are leaving to an external link. Do you want to proceed?");

      if (confirmResult) {
        // redirect client to whatsapp with the inputted data
        const formValue = this.centerForm.value;

        // Format the message to be sent via WhatsApp
        const whatsappMessage = `Hello, I am interested in your web application services.\n`
          + `My name is ${formValue.name}, and I want to partnership as a TRAINING CENTER\n`
          + `Here are the links to my social media profiles\n`
          + `Facebook: ${formValue.facebookUrl}\n`
          + `Instagram: ${formValue.instagramUrl}\n`
          + `Twitter: ${formValue.twitterUrl}\n`
          + `Motivation: ${formValue.motivation}`;

        console.log(whatsappMessage);

        // Replace the phone number below with the actual WhatsApp phone number you want to contact
        const phoneNumber = '+212610310304';

        // Create the WhatsApp URL with the message as a query parameter
        const whatsappURL = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(whatsappMessage)}`;

        // Redirect the user to the WhatsApp URL
        window.location.href = whatsappURL;
        this.centerForm.reset();
      }
      else {

      }
      console.log('You submitted: ', this.centerForm.value)
      this.centerForm.reset();
      this.invalidForm = false;
    }
    return false;
  }
}
