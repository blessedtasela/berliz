import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {

  constructor(private snackBar: MatSnackBar) { }

  openSnackBar(message: string, action: string) {
    const panelClass = action === 'error' ? 'snack-bar-error' : 'snack-bar-success';

    if (action === 'error') {
      this.snackBar.open(message, '', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
        duration: 4000,
        panelClass: [panelClass],
   
      });
    } else {

      this.snackBar.open(message, '', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
        duration: 4000,
        panelClass: [panelClass]
      });
    }
  }
}
