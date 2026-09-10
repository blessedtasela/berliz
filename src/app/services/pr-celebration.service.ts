import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { PrCelebrationModalComponent } from '../shared/pr-celebration/pr-celebration-modal.component';

/**
 * Call `maybeCelebrate(res.data?.personalBests, 'run' | 'workout')` right after
 * a log save; it pops the "🏆 New personal best!" dialog only when there's at
 * least one PB line. Kept as a service so every log-save surface wires it in
 * one line instead of hand-rolling the dialog.
 */
@Injectable({ providedIn: 'root' })
export class PrCelebrationService {
  constructor(private dialog: MatDialog) {}

  maybeCelebrate(bests: string[] | undefined | null, kind: 'workout' | 'run'): void {
    if (!bests || bests.length === 0) return;
    this.dialog.open(PrCelebrationModalComponent, {
      width: '360px',
      maxWidth: '95vw',
      data: { bests, kind },
    });
  }
}
