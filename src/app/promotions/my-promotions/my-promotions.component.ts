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
 * Self-service promotions on the trainer/center's own profile -- "new member
 * discount", "free first session", "limited-time offer". Shows up publicly
 * as a badge (see PromoBadgeListComponent) on their trainer/center detail
 * page while live.
 */
@Component({
  selector: 'app-my-promotions',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './my-promotions.component.html',
  styleUrls: ['./my-promotions.component.css']
})
export class MyPromotionsComponent implements OnInit {

  promotions: PromoOffer[] = [];
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
    this.promotionService.getMine().pipe(take(1)).subscribe({
      next: (res) => {
        this.promotions = res?.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.openSnackBar(genericError, 'error');
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
        this.snackBar.openSnackBar(res?.message || 'Updated', '');
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
          this.snackBar.openSnackBar(res?.message || 'Promotion deleted', '');
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
