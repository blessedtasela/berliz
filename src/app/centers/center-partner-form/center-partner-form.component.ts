import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { Users } from 'src/app/models/users.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PartnerFormComponent } from 'src/app/shared/partner-form/partner-form.component';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { loadUser } from 'src/app/state/user/user.actions';
import { selectUser } from 'src/app/state/user/user.selector';

@Component({
  selector: 'app-center-partner-form',
  templateUrl: './center-partner-form.component.html',
  styleUrls: ['./center-partner-form.component.css']
})
export class CenterPartnerFormComponent implements OnInit {

  user!: Users | null;
  destroy$ = new Subject<void>();
  requirements = [
    'A valid business or facility registration certificate (PDF)',
    'An up-to-date resume or business profile (PDF)',
    'A motivation statement between 900 and 1200 characters',
    'A Facebook profile URL',
    'An Instagram profile URL',
    'An optional YouTube profile or channel URL',
    'Accurate business and contact information',
    'Agreement to comply with Berliz center standards and policies'
  ];

  constructor(
    private store: Store,
    private snackBar: SnackBarService,
    private dialog: MatDialog,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.store.dispatch(loadUser());

    this.store.select(selectUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.user = user;
      });
  }

  // ── Modal open / close ────────────────────────────────────────────────────

  openPartnerForm(): void {
    const userEmail = this.user?.email;

    if (!userEmail) {
      const loginDialogRef = this.dialog.open(PromptModalComponent, {
        width: '400px',
        data: {
          confirmation: true,
          title: 'Login required',
          message: 'You need to be logged in to apply as a center partner. Log in to continue?',
          confirmText: 'Log in',
          cancelText: 'Cancel',
          icon: 'log-in'
        }
      });

      loginDialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    const dialogRef = this.dialog.open(PartnerFormComponent, {
      width: '600px',
      disableClose: true,
      data: {
        email: userEmail,
        role: 'center'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.openSnackBar(
          'Center application submitted successfully.',
          'success'
        );
      }
    });
  }

}
