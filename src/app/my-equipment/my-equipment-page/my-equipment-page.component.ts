import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { CenterService } from 'src/app/services/center.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { CenterEquipment } from 'src/app/models/centers.interface';
import { StrapiUrlPipe } from 'src/app/shared/pipes/strapi-url.pipe';
import { genericError } from 'src/validators/form-validators.module';

/**
 * Dashboard-native "My Equipment" for trainers — read-only list of equipment
 * an admin has assigned to them, with a self-service "featured" toggle.
 * Trainers don't add/edit equipment themselves (that's admin-managed, same
 * as it always was for centers); this mirrors the center's self-service
 * equipment card minus the add/edit form.
 */
@Component({
  selector: 'app-my-equipment-page',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule, StrapiUrlPipe],
  templateUrl: './my-equipment-page.component.html',
  styleUrls: ['./my-equipment-page.component.css']
})
export class MyEquipmentPageComponent implements OnInit {

  equipment: CenterEquipment[] = [];
  loading = true;
  togglingId: number | null = null;

  constructor(
    private centerService: CenterService,
    private snackBar: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.centerService.getMyEquipment()
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

  toggleFeatured(item: CenterEquipment): void {
    this.togglingId = item.id;
    this.centerService.updateEquipmentFeatured(item.id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.togglingId = null;
          this.load();
        },
        error: (err: any) => {
          this.togglingId = null;
          this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
        }
      });
  }
}
