import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { Users } from 'src/app/models/users.interface';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { loadUser } from 'src/app/state/user/user.actions';
import { selectUser } from 'src/app/state/user/user.selector';
import { TestimonialFormComponent } from './testimonial-form/testimonial-form.component';

/**
 * Opens the "leave a testimonial" form as a modal, gated on the visitor being
 * logged in. Shared by the testimonials hero and list so the login gate lives
 * in exactly one place.
 */
@Injectable({ providedIn: 'root' })
export class TestimonialDialogService {

  private user: Users | null = null;

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private router: Router,
  ) {
    // Same pattern as trainer-partner-form: keep the current user warm so the
    // login gate can decide synchronously on click.
    this.store.dispatch(loadUser());
    this.store.select(selectUser).subscribe(user => this.user = user);
  }

  openTestimonialForm(): void {
    const userEmail = this.user?.email;

    if (!userEmail) {
      const loginDialogRef = this.dialog.open(PromptModalComponent, {
        width: '400px',
        maxWidth: '95vw',
        data: {
          confirmation: true,
          title: 'Login required',
          message: 'You need to be logged in to leave a testimonial. Log in to continue?',
          confirmText: 'Log in',
          cancelText: 'Cancel',
          icon: 'log-in'
        }
      });

      loginDialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    this.dialog.open(TestimonialFormComponent, {
      width: '560px',
      maxWidth: '95vw',
      disableClose: true,
      data: { email: userEmail }
    });
  }
}
