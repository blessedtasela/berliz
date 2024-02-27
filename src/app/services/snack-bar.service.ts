import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})

export class SnackBarService {

  constructor(private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer) { }

  openSnackBar(message: string, action: string) {
    const panelClass = action === 'error' ? 'snack-bar-error' : 'snack-bar-success';
    const closeBtn = `X`;
    const sanitizedCloseBtn = this.sanitizer.bypassSecurityTrustHtml(closeBtn);
    this.snackBar.open(message, closeBtn + '', {
      horizontalPosition: 'center',
      verticalPosition: 'top',
      duration: 4000,
      panelClass: [panelClass],
      data: { htmlContent: sanitizedCloseBtn }
    });
  }

}
