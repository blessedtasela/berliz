import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TrainerSubscriptionForm } from 'src/app/models/trainers.interface';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';

@Component({
  selector: 'app-chat-with-trainer',
  templateUrl: './chat-with-trainer.component.html',
  styleUrls: ['./chat-with-trainer.component.css']
})
export class ChatWithTrainerComponent {
  @Input() whatsappContact: TrainerSubscriptionForm | undefined;
  showPopUp = false;

  constructor(private dialog: MatDialog) { }

  chatWhatsapp() {
    this.dialog.open(PromptModalComponent, {
      width: '400px',
      maxWidth: '95vw',
      data: {
        confirmation: true,
        title: 'Leaving Berliz',
        message: 'You are leaving to an external link (WhatsApp). Do you want to proceed?',
        confirmText: 'Proceed',
        cancelText: 'Cancel',
        icon: 'external-link'
      }
    }).afterClosed().subscribe(confirmResult => {
      if (!confirmResult) return;

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
    });
  }

}
