import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { PromotionService } from 'src/app/services/promotion.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { PromotionFormModalComponent } from '../promotion-form-modal/promotion-form-modal.component';
import { PromoOffer } from 'src/app/models/promo-offer.model';
import { genericError } from 'src/validators/form-validators.module';

/**
 * Admin-run growth campaigns -- platform-wide promotions with no trainer/
 * center owner (e.g. "first 10 sign-ups get a free session"). Created here
 * with the same form provider promos use; the backend decides it's a
 * platform campaign because an admin, not a trainer/center, is calling
 * /promotion/create. A live "free_session" + "new_members" campaign is what
 * PromotionServiceImplement.grantPlatformSignupCreditIfEligible looks for on
 * every new account activation.
 */
@Component({
  selector: 'app-admin-campaigns',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './admin-campaigns.component.html',
  styleUrls: ['./admin-campaigns.component.css']
})
export class AdminCampaignsComponent implements OnInit {

  campaigns: PromoOffer[] = [];
  loading = true;

  constructor(
    private promotionService: PromotionService,
    private snackBar: SnackBarService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.load();
  }

  refresh(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.promotionService.getPlatformCampaigns().pipe(take(1)).subscribe({
      next: (res) => { this.campaigns = res?.data ?? []; this.loading = false; },
      error: () => { this.loading = false; this.snackBar.openSnackBar(genericError, 'error'); }
    });
  }

  openAdd(): void {
    const dialogRef = this.dialog.open(PromotionFormModalComponent, { width: '440px', maxWidth: '95vw', data: {} });
    dialogRef.afterClosed().pipe(take(1)).subscribe(saved => { if (saved) this.load(); });
  }

  openEdit(campaign: PromoOffer): void {
    const dialogRef = this.dialog.open(PromotionFormModalComponent, { width: '440px', maxWidth: '95vw', data: { promotion: campaign } });
    dialogRef.afterClosed().pipe(take(1)).subscribe(saved => { if (saved) this.load(); });
  }

  toggle(campaign: PromoOffer): void {
    this.promotionService.toggle(campaign.id, !campaign.active).pipe(take(1)).subscribe({
      next: (res: any) => { this.snackBar.openSnackBar(res?.message || 'Updated', ''); this.load(); },
      error: (err: any) => this.snackBar.openSnackBar(err?.error?.message || genericError, 'error')
    });
  }

  remove(campaign: PromoOffer): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { message: `delete "${campaign.title}"? This can't be undone.`, confirmation: true, disableClose: true };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    dialogRef.componentInstance.onEmitStatusChange.pipe(take(1)).subscribe(() => {
      this.promotionService.delete(campaign.id).pipe(take(1)).subscribe({
        next: (res: any) => { this.snackBar.openSnackBar(res?.message || 'Campaign deleted', ''); dialogRef.close(); this.load(); },
        error: (err: any) => { this.snackBar.openSnackBar(err?.error?.message || genericError, 'error'); dialogRef.close(); }
      });
    });
  }

  label(p: PromoOffer): string {
    switch (p.type) {
      case 'percentage': return `${p.value ?? ''}% off`;
      case 'fixed': return `$${p.value ?? ''} off`;
      case 'free_session': return 'Free session';
      default: return 'Custom offer';
    }
  }
}
