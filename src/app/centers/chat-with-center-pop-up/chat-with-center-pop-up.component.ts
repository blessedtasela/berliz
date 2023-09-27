import { Component, HostListener, Input } from '@angular/core';
import { CenterSubscriptionForm } from 'src/app/models/centers.interface';

@Component({
  selector: 'app-chat-with-center-pop-up',
  templateUrl: './chat-with-center-pop-up.component.html',
  styleUrls: ['./chat-with-center-pop-up.component.css']
})
export class ChatWithCenterPopUpComponent {
  showPopUp = false;
  hidePopUp: boolean = false;
  @Input() whatsappContact: CenterSubscriptionForm | undefined;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showPopUp = window.scrollY > 500;
  }

  chatWhatsapp() {
    const phoneNumber = this.whatsappContact?.whatsapp;

    // add a prompt for the user to confirm they are opening an external link
      const confirmResult = window.confirm("You are leaving to an external link. Do you want to proceed?");

    if (confirmResult) {
     // Format the message to be sent via WhatsApp
     const whatsappMessage = `Hello, I am interested in your services.\n`
     + `I want to know more about the training plans and programs in your gym club.\n`
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
