import { Component } from '@angular/core';
import { Route, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BerlizFeedbackModalComponent } from '../berliz-feedback-modal/berliz-feedback-modal.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {

  currentYear: number = new Date().getFullYear();
  constructor(private router: Router, private dialog: MatDialog) {

  }

  openFeedback(): void {
    this.dialog.open(BerlizFeedbackModalComponent, {
      width: '460px',
      maxWidth: '95vw',
      maxHeight: '90vh',
    });
  }

  goToSection(sectionId: string) {
    const element = document.querySelector(`#${sectionId}`);
    if (element) {
      this.router.navigate(['/trainers']);
      element.scrollIntoView({
        behavior: 'smooth'
      })
    }
  }
}
