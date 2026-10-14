import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, DestroyRef, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Partner } from 'src/app/models/partners.interface';
import { Users } from 'src/app/models/users.interface';
import { PartnerFormModalComponent } from 'src/app/shared/partner-form-modal/partner-form-modal.component';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { Store } from '@ngrx/store';
import { AuthRedirectService } from 'src/app/services/auth-redirect.service';
import { selectUser } from 'src/app/state/user/user.selector';
import { loadMyPartner } from 'src/app/state/partner/partner.actions';
import { selectMyPartner } from 'src/app/state/partner/partner.selectors';

@Component({
    selector: 'app-center-header',
    templateUrl: './center-header.component.html',
    styleUrls: ['./center-header.component.css'],
    standalone: false
})
export class CenterHeaderComponent {
  private destroyRef = inject(DestroyRef);
  partner!: Partner;
  user!: Users | null;

  constructor(private dialog: MatDialog,
    private store: Store,
    private authRedirect: AuthRedirectService) { }

  ngOnInit() {
    this.store.select(selectUser).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      this.user = user;
    })
  }

  handleEmitEvent() {
    this.store.dispatch(loadMyPartner());
    this.store.select(selectMyPartner).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((partnerData) => {
      if (partnerData) this.partner = partnerData;
    });
  }

  openAddPartner() {
    if (!this.user) {
      this.dialog.open(PromptModalComponent, {
        width: '400px',
        maxWidth: '95vw',
        data: {
          confirmation: true,
          title: 'Login required',
          message: 'You need to be logged in to add a partner. Log in to continue?',
          confirmText: 'Log in',
          cancelText: 'Cancel',
          icon: 'log-in'
        }
      }).afterClosed().subscribe(result => {
        if (result) this.authRedirect.goToLogin();
      });
    } else {
      const dialogRef = this.dialog.open(PartnerFormModalComponent, {
        width: '560px',
        maxWidth: '95vw',
        panelClass: 'mat-dialog-height',
      });
      const childComponentInstance = dialogRef.componentInstance as PartnerFormModalComponent;

      // Set the event emitter before closing the dialog
      childComponentInstance.onAddPartnerEmit.subscribe(() => {
        this.handleEmitEvent();
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
        } else {
        }
      });
    }
  }

}
