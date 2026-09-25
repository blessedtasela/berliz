import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { ProviderPackageService } from 'src/app/services/provider-package.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { ProviderPackageFormModalComponent } from '../provider-package-form-modal/provider-package-form-modal.component';
import { ProviderPackage, ProviderPackageRequest } from 'src/app/models/provider-package.model';
import { genericError } from 'src/validators/form-validators.module';

/**
 * Self-service sellable-package catalog on the trainer/center's own
 * dashboard -- "5 sessions for $200", "monthly unlimited", a group class of
 * N. Purchasing one isn't wired yet (see ProviderPackage.java's own doc
 * comment on the backend) -- this page just lets a provider define and
 * manage what they'd sell.
 */
@Component({
  selector: 'app-my-provider-packages',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './my-provider-packages.component.html',
  styleUrls: ['./my-provider-packages.component.css']
})
export class MyProviderPackagesComponent implements OnInit {

  packages: ProviderPackage[] = [];
  loading = true;

  constructor(
    private packageService: ProviderPackageService,
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
    this.packageService.getMine().pipe(take(1)).subscribe({
      next: (res) => {
        this.packages = res?.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.openSnackBar(genericError, 'error');
      }
    });
  }

  openAdd(): void {
    const dialogRef = this.dialog.open(ProviderPackageFormModalComponent, { width: '440px', maxWidth: '95vw', data: {} });
    dialogRef.afterClosed().pipe(take(1)).subscribe(saved => { if (saved) this.load(); });
  }

  openEdit(pkg: ProviderPackage): void {
    const dialogRef = this.dialog.open(ProviderPackageFormModalComponent, { width: '440px', maxWidth: '95vw', data: { pkg } });
    dialogRef.afterClosed().pipe(take(1)).subscribe(saved => { if (saved) this.load(); });
  }

  /** No dedicated toggle endpoint -- update() fully overwrites the row, so resend every field with just isActive flipped. */
  toggle(pkg: ProviderPackage): void {
    const payload: ProviderPackageRequest = {
      name: pkg.name,
      description: pkg.description,
      sessionCount: pkg.sessionCount,
      price: pkg.price,
      currency: pkg.currency,
      durationDays: pkg.durationDays,
      groupSize: pkg.groupSize,
      billingType: pkg.billingType,
      isActive: !pkg.isActive,
      sortOrder: pkg.sortOrder,
    };

    this.packageService.update(pkg.id, payload).pipe(take(1)).subscribe({
      next: (res: any) => {
        this.snackBar.openSnackBar(res?.message || 'Updated', '');
        this.load();
      },
      error: (err: any) => this.snackBar.openSnackBar(err?.error?.message || genericError, 'error')
    });
  }

  remove(pkg: ProviderPackage): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: `delete "${pkg.name}"? This can't be undone.`,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    dialogRef.componentInstance.onEmitStatusChange.pipe(take(1)).subscribe(() => {
      this.packageService.delete(pkg.id).pipe(take(1)).subscribe({
        next: (res: any) => {
          this.snackBar.openSnackBar(res?.message || 'Package deleted', '');
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

  label(pkg: ProviderPackage): string {
    if (pkg.sessionCount) return `${pkg.sessionCount} session${pkg.sessionCount !== 1 ? 's' : ''}`;
    return pkg.billingType === 'RECURRING' ? 'Monthly unlimited' : 'Unlimited';
  }
}
