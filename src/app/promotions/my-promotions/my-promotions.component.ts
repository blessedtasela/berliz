import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { PromotionService } from 'src/app/services/promotion.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
import { PromotionFormModalComponent } from '../promotion-form-modal/promotion-form-modal.component';
import { PromoOffer } from 'src/app/models/promo-offer.model';
import { genericError } from 'src/validators/form-validators.module';

/**
 * Self-service promotions on the trainer/center's own profile -- "new member
 * discount", "free first session", "limited-time offer". Shows up publicly
 * as a badge (see PromoBadgeListComponent) on their trainer/center detail
 * page while live.
 */
@Component({
    selector: 'app-my-promotions',
    imports: [CommonModule, IconsModule, LoadErrorComponent],
    templateUrl: './my-promotions.component.html',
    styleUrls: ['./my-promotions.component.css']
})
export class MyPromotionsComponent implements OnInit {

  promotions: PromoOffer[] = [];
  loading = true;
  /** Set when the promotions list failed to load; shown inline with a Retry. */
  loadError: string | null = null;

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

  load(): void {
    this.loading = true;
    this.loadError = null;
    this.promotionService.getMine().pipe(take(1)).subscribe({
      next: (res) => {
        this.promotions = res?.data ?? [];
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.loadError = err?.error?.message || genericError;
      }
    });
  }

  openAdd(): void {
    const dialogRef = this.dialog.open(PromotionFormModalComponent, { width: '440px', maxWidth: '95vw', data: {} });
    dialogRef.afterClosed().pipe(take(1)).subscribe(saved => { if (saved) this.load(); });
  }

  openEdit(promotion: PromoOffer): void {
    const dialogRef = this.dialog.open(PromotionFormModalComponent, { width: '440px', maxWidth: '95vw', data: { promotion } });
    dialogRef.afterClosed().pipe(take(1)).subscribe(saved => { if (saved) this.load(); });
  }

  toggle(promotion: PromoOffer): void {
    this.promotionService.toggle(promotion.id, !promotion.active).pipe(take(1)).subscribe({
      next: (res: any) => {
        this.snackBar.openSnackBar(res?.message || `"${promotion.title}" ${promotion.active ? 'paused' : 'activated'}`, '');
        this.load();
      },
      error: (err: any) => this.snackBar.openSnackBar(err?.error?.message || genericError, 'error')
    });
  }

  remove(promotion: PromoOffer): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: `delete "${promotion.title}"? This can't be undone.`,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    dialogRef.componentInstance.onEmitStatusChange.pipe(take(1)).subscribe(() => {
      this.promotionService.delete(promotion.id).pipe(take(1)).subscribe({
        next: (res: any) => {
          this.snackBar.openSnackBar(res?.message || `Promotion "${promotion.title}" deleted`, '');
          dialogRef.close();
          this.load();
        },
        error: (err: any) => {
          this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
          dialogRef.close();
        }
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
