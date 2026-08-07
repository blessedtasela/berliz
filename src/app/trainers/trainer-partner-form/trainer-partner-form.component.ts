import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Users } from 'src/app/models/users.interface';
import { PartnerService } from 'src/app/services/partner.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PartnerFormComponent } from 'src/app/shared/partner-form/partner-form.component';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { fileValidator, genericError } from 'src/validators/form-validators.module';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { loadUser } from 'src/app/state/user/user.actions';
import { selectUser } from 'src/app/state/user/user.selector';

@Component({
  selector: 'app-trainer-partner-form',
  templateUrl: './trainer-partner-form.component.html',
  styleUrls: ['./trainer-partner-form.component.css']
})
export class TrainerPartnerFormComponent implements OnInit {

  addPartnerForm!: FormGroup;
  invalidForm = false;
  modalOpen = false;
  user!: Users | null;
  destroy$ = new Subject<void>();
  requirements = [
    'A valid fitness or coaching certification (PDF)',
    'An up-to-date resume or CV (PDF)',
    'A motivation statement between 900 and 1200 characters',
    'A Facebook profile URL',
    'An Instagram profile URL',
    'An optional YouTube profile or channel URL',
    'At least 2 feature videos showcasing your expertise',
    'Accurate personal and professional information',
    'Agreement to comply with Berliz trainer standards and policies'
  ];

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private ngxService: NgxUiLoaderService,
    private snackBar: SnackBarService,
    private partnerService: PartnerService,
    private dialog: MatDialog,
    private router: Router,
  ) { }

  ngOnInit(): void {
   // Load user from store
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
        maxWidth: '95vw',
        data: {
          confirmation: true,
          title: 'Login required',
          message: 'You need to be logged in to apply as a trainer. Log in to continue?',
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
      maxWidth: '95vw',
      disableClose: true,
      data: {
        email: userEmail,
        role: 'trainer'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // optional: refresh list / show success / reload data
        this.snackBar.openSnackBar(
          'Trainer application submitted successfully.',
          'success'
        );
      }
    });
  }


}