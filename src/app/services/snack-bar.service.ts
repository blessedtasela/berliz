import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {

  private currentRef: MatSnackBarRef<any> | null = null;

  constructor(private snackBar: MatSnackBar) { }

  openSnackBar(message: string, action: string): void {
    // Always dismiss any open snackbar first — prevents stuck overlays
    this.dismiss();

    if (!message) return;

    const isError = action === 'error';
    const panelClass = isError ? 'snack-bar-error' : 'snack-bar-success';

    try {
      // On mobile, the CDK overlay pane sizes itself to its content before our
      // CSS margin can shrink it, so a right-aligned snackbar still spans edge
      // to edge. Centering it sidesteps that entirely instead of fighting the
      // overlay pane's own width.
      const isMobile = window.innerWidth <= 480;

      this.currentRef = this.snackBar.open(message, '✕', {
        horizontalPosition: isMobile ? 'center' : 'right',
        verticalPosition: 'top',
        duration: isError ? 6000 : 4000,
        panelClass: [panelClass, 'berliz-snackbar'],
      });

      this.currentRef.afterDismissed().subscribe(() => {
        this.currentRef = null;
      });

    } catch {
      // Fallback: if MatSnackBar itself fails, do nothing — don't let the
      // snackbar error cascade into the calling component
    }
  }

  dismiss(): void {
    try {
      if (this.currentRef) {
        this.currentRef.dismiss();
        this.currentRef = null;
      }
      // Also dismiss anything that MatSnackBar is holding
      this.snackBar.dismiss();
    } catch {
      // Silently ignore — overlay may already be gone
    }
  }
}