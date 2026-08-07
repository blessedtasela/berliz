import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CenterEquipment } from 'src/app/models/centers.interface';

export interface EquipmentDetailsData {
  equipment: CenterEquipment;
  /** Resolved discipline names — the entity only carries `categoryIds`. */
  categoryNames?: string[];
}

/**
 * Read-only detail view for a single piece of center equipment.
 *
 * A dialog rather than a routed page: there is no `/equipments/:id` route to
 * hang a detail component off, and the record is small enough (name, blurb,
 * stock, four photos) that a modal keeps the browsing context intact.
 */
@Component({
  selector: 'app-equipment-details-modal',
  templateUrl: './equipment-details-modal.component.html',
  styleUrls: ['./equipment-details-modal.component.css']
})
export class EquipmentDetailsModalComponent {

  equipment: CenterEquipment;
  categoryNames: string[];

  /** Currently enlarged photo — defaults to the primary image. */
  activePhoto: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: EquipmentDetailsData,
    public dialogRef: MatDialogRef<EquipmentDetailsModalComponent>
  ) {
    this.equipment = dialogData?.equipment;
    this.categoryNames = dialogData?.categoryNames ?? [];
    this.activePhoto = this.photos[0] ?? null;
  }

  /** Every non-empty view URL on the record, primary image first. */
  get photos(): string[] {
    const item = this.equipment;
    if (!item) return [];

    return [item.imageUrl, item.frontViewUrl, item.sideViewUrl, item.rearViewUrl]
      .filter((url): url is string => !!url && url.trim() !== '');
  }

  setActivePhoto(url: string): void {
    this.activePhoto = url;
  }

  formatUrl(value: string): string {
    return (value ?? '').replace(/ /g, '-');
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
