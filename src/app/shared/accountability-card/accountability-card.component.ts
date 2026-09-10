import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { PartnerStatusResponse } from 'src/app/models/accountability.interface';
import { AccountabilityService } from 'src/app/services/accountability.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { ManagePartnersModalComponent } from './manage-partners-modal.component';
import { memoizePhotoUriByKey } from 'src/app/shared/photo-lightbox/photo-data-uri';

/**
 * Dashboard card: your accountability partners and, for any who've gone quiet,
 * a one-tap nudge. Collapses to a single "set up partners" prompt when none
 * are configured.
 */
@Component({
  selector: 'app-accountability-card',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './accountability-card.component.html',
})
export class AccountabilityCardComponent implements OnInit {
  partners: PartnerStatusResponse[] = [];
  loading = true;
  nudging = new Set<number>();

  private readonly _rowUri = memoizePhotoUriByKey();
  photoSrc(p: PartnerStatusResponse): string | null {
    return this._rowUri(p.userId, p.profilePhoto);
  }

  constructor(
    private accountability: AccountabilityService,
    private snackBar: SnackBarService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.accountability.getPartners().pipe(take(1)).subscribe({
      next: res => { this.loading = false; this.partners = res.data ?? []; },
      error: () => { this.loading = false; },
    });
  }

  get lapsing(): PartnerStatusResponse[] {
    return this.partners.filter(p => p.lapsing);
  }

  nudge(p: PartnerStatusResponse): void {
    if (this.nudging.has(p.userId) || p.nudgedRecently) return;
    this.nudging.add(p.userId);
    this.accountability.nudge(p.userId).pipe(take(1)).subscribe({
      next: () => {
        this.nudging.delete(p.userId);
        p.nudgedRecently = true;
        this.snackBar.openSnackBar(`Nudged ${p.name}`, '');
      },
      error: err => {
        this.nudging.delete(p.userId);
        this.snackBar.openSnackBar(err?.error?.message || 'Could not send nudge', 'error');
      },
    });
  }

  manage(): void {
    this.dialog.open(ManagePartnersModalComponent, { width: '360px', maxWidth: '95vw' })
      .afterClosed().subscribe(changed => { if (changed) this.load(); });
  }

  daysLabel(p: PartnerStatusResponse): string {
    if (p.daysSinceLastActivity < 0) return 'no logged sessions yet';
    if (p.daysSinceLastActivity === 0) return 'trained today';
    if (p.daysSinceLastActivity === 1) return '1 day since a session';
    return `${p.daysSinceLastActivity} days since a session`;
  }
}
