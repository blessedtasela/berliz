import { Component, inject } from '@angular/core';
import { Route, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BerlizFeedbackModalComponent } from '../berliz-feedback-modal/berliz-feedback-modal.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css'],
    standalone: false
})
export class FooterComponent {

  currentYear: number = new Date().getFullYear();
  private auth = inject(AuthService);

  constructor(private router: Router, private dialog: MatDialog) {

  }

  /** Feedback needs an account (Report a Problem does not), so the link says so before it is clicked. */
  get feedbackNeedsLogin(): boolean {
    return !this.auth.isAuthenticated();
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
