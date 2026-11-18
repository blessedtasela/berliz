import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { take } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { CenterMember } from 'src/app/models/centers.interface';
import { CenterService } from 'src/app/services/center.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { nameSlug } from 'src/app/utils/closest-slug';
import { genericError } from 'src/validators/form-validators.module';

/** The signed-in user's own view: every center they personally belong to as a member --
 *  distinct from CenterMembersComponent, which is the center owner managing their roster.
 *  GN-47: this roster entry carries no billing, so leaving is a single confirm + delete,
 *  same bar as the booking/plan cancel flows -- no separate "contact support" step. */
@Component({
  selector: 'app-my-center-memberships',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule, LoadErrorComponent],
  providers: [DatePipe],
  templateUrl: './my-center-memberships.component.html',
})
export class MyCenterMembershipsComponent implements OnInit {

  memberships: CenterMember[] = [];
  loading = true;
  loadError: string | null = null;
  leavingId: number | null = null;

  constructor(
    private centerService: CenterService,
    private snackBar: SnackBarService,
    private datePipe: DatePipe,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = null;
    this.centerService.getMyCenterMemberships().pipe(take(1)).subscribe({
      next: res => { this.memberships = res?.data ?? []; this.loading = false; },
      error: err => {
        this.loading = false;
        const message = err?.error?.message || genericError;
        this.loadError = message;
        this.snackBar.openSnackBar(message, 'error');
      },
    });
  }

  isActive(status: string): boolean {
    return status?.toLowerCase() === 'true' || status?.toLowerCase() === 'active';
  }

  centerSlug(name: string): string {
    return nameSlug(name);
  }

  formatDate(date: unknown): string {
    return this.datePipe.transform(new Date(date as string), 'mediumDate') ?? '';
  }

  leave(membership: CenterMember): void {
    this.dialog.open(PromptModalComponent, {
      width: '360px',
      maxWidth: '95vw',
      data: {
        confirmation: true,
        title: `Leave ${membership.centerName}?`,
        message: 'You\'ll no longer appear on their member roster. You can re-join later if the center adds you back.',
        confirmText: 'Leave',
        cancelText: 'Stay',
        icon: 'log-out',
      },
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) this.confirmLeave(membership);
    });
  }

  private confirmLeave(membership: CenterMember): void {
    this.leavingId = membership.id;
    this.centerService.removeMember(membership.id).pipe(take(1)).subscribe({
      next: () => {
        this.leavingId = null;
        this.memberships = this.memberships.filter(m => m.id !== membership.id);
        this.snackBar.openSnackBar(`You've left ${membership.centerName}.`, 'success');
      },
      error: err => {
        this.leavingId = null;
        this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
      },
    });
  }
}
