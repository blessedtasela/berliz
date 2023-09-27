import { Component, HostListener, Input } from '@angular/core';
import { TrainerSubscriptionForm } from 'src/app/models/trainers.interface';

@Component({
  selector: 'app-chat-with-trainer-pop-up',
  templateUrl: './chat-with-trainer-pop-up.component.html',
  styleUrls: ['./chat-with-trainer-pop-up.component.css']
})
export class ChatWithTrainerPopUpComponent {
  @Input() whatsappContact: TrainerSubscriptionForm | undefined;
  showPopUp = false;
  hidePopUp: boolean = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showPopUp = window.scrollY > 500;
  }

  chatWhatsapp() {
    const phoneNumber = this.whatsappContact?.whatsapp;

    // Construct the WhatsApp URL with the phone number and optional message
    const whatsappUrl = `https://wa.me/${phoneNumber}`;

    // add a prompt for the user to confirm they are opening an external link
      const confirmResult = window.confirm("You are leaving to an external link. Do you want to proceed?");

    if (confirmResult) {
      // Format the message to be sent via WhatsApp
      const whatsappMessage = `Hello, I am interested in your services.\n`
        + `I want to know more about your training programs.\n`
        + `My name is `;

      console.log(whatsappMessage);

      // Replace the phone number below with the actual WhatsApp phone number you want to contact
      const phoneNumber = this.whatsappContact?.whatsapp;

      // Create the WhatsApp URL with the message as a query parameter
      const whatsappURL = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(whatsappMessage)}`;

      // Redirect the user to the WhatsApp URL
      window.location.href = whatsappURL;
    } else {
      // The user clicked "Cancel", do nothing
    }
  }

  hidePop() {
    this.hidePopUp = true;
  }
}
