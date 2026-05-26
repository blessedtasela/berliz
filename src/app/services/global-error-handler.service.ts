import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { SnackBarService } from './snack-bar.service';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {

  constructor(
    private snackbar: SnackBarService,
    private zone: NgZone
  ) { }

  handleError(error: any): void {
    // Always dismiss stuck snackbar on any unhandled error
    this.zone.run(() => {
      this.snackbar.dismiss();
    });

    // Re-throw so Angular's normal error logging still works
    console.error('Unhandled error:', error);
  }
}