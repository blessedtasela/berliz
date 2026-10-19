import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

/**
 * Opens the CV / certificate viewers. The PDF viewer library is ~660 KB, so the modals are imported on demand
 * instead of riding along in the initial bundle every visitor downloads.
 */
export function openCvModal(dialog: MatDialog, config: MatDialogConfig): void {
  import('./view-cv-modal/view-cv-modal.component').then(m => dialog.open(m.ViewCvModalComponent, config));
}

export function openCertificateModal(dialog: MatDialog, config: MatDialogConfig): void {
  import('./view-certificate-modal/view-certificate-modal.component').then(m => dialog.open(m.ViewCertificateModalComponent, config));
}
