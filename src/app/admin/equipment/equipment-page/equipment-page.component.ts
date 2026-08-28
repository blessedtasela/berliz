import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { CenterService } from 'src/app/services/center.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { CenterEquipment } from 'src/app/models/centers.interface';
import { StrapiUrlPipe } from 'src/app/shared/pipes/strapi-url.pipe';
import { genericError } from 'src/validators/form-validators.module';
import { EquipmentModalComponent } from '../equipment-modal/equipment-modal.component';
import { ClickablePhotoDirective } from 'src/app/shared/photo-lightbox/clickable-photo.directive';

/**
 * Admin equipment CRUD — every piece of equipment across every center and
 * trainer, in one table. Equipment self-service (add/edit/delete) still
 * lives on the owning center/trainer's own dashboard card; this page is
 * for admins to manage the full catalog and assign equipment to an owner.
 */
@Component({
  selector: 'app-equipment-page',
  standalone: true,
  imports: [ClickablePhotoDirective, CommonModule, FormsModule, IconsModule, StrapiUrlPipe],
  templateUrl: './equipment-page.component.html',
  styleUrls: ['./equipment-page.component.css']
})
export class EquipmentPageComponent implements OnInit {

  equipment: CenterEquipment[] = [];
  loading = true;
  searchTerm = '';
  togglingId: number | null = null;

  constructor(
    private centerService: CenterService,
    private snackBar: SnackBarService,
    private dialog: MatDialog,
    private loader: NgxUiLoaderService,
  ) { }

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.centerService.getAllEquipment()
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          this.equipment = res?.data ?? [];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snackBar.openSnackBar(genericError, 'error');
        }
      });
  }

  get filtered(): CenterEquipment[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.equipment;
    return this.equipment.filter(e =>
      e.name?.toLowerCase().includes(term) ||
      e.centerName?.toLowerCase().includes(term) ||
      e.trainerName?.toLowerCase().includes(term)
    );
  }

  ownerLabel(item: CenterEquipment): string {
    return item.trainerName || item.centerName || '—';
  }

  ownerType(item: CenterEquipment): 'center' | 'trainer' {
    return item.trainerId ? 'trainer' : 'center';
  }

  openAdd(): void {
    const dialogRef = this.dialog.open(EquipmentModalComponent, {
      width: '560px',
      maxWidth: '95vw',
    });
    dialogRef.afterClosed().subscribe((saved: boolean) => {
      if (saved) this.load();
    });
  }

  openEdit(item: CenterEquipment): void {
    const dialogRef = this.dialog.open(EquipmentModalComponent, {
      width: '560px',
      maxWidth: '95vw',
      data: { equipment: item },
    });
    dialogRef.afterClosed().subscribe((saved: boolean) => {
      if (saved) this.load();
    });
  }

  toggleFeatured(item: CenterEquipment): void {
    this.togglingId = item.id;
    this.centerService.updateEquipmentFeatured(item.id)
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          this.togglingId = null;
          this.snackBar.openSnackBar(res?.message || 'Updated successfully', '');
          this.load();
        },
        error: (err: any) => {
          this.togglingId = null;
          this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
        }
      });
  }

  deleteEquipment(item: CenterEquipment): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: `delete "${item.name}"? This cannot be undone.`,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    dialogRef.componentInstance.onEmitStatusChange.pipe(take(1)).subscribe(() => {
      this.loader.start();
      this.centerService.deleteEquipment(item.id)
        .pipe(take(1))
        .subscribe({
          next: (res: any) => {
            this.loader.stop();
            this.snackBar.openSnackBar(res?.message || 'Equipment deleted', '');
            dialogRef.close();
            this.load();
          },
          error: (err: any) => {
            this.loader.stop();
            this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
            dialogRef.close();
          }
        });
    });
  }
}
