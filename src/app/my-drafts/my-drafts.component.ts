import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { IconsModule } from 'src/app/icons/icons.module';
import { DraftEntry } from 'src/app/models/draft.model';
import { DraftService } from 'src/app/services/draft.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';

/**
 * Every unfinished action across the app in one place -- `/dashboard/my-drafts`.
 * A user who abandons a half-written post, a booking they never confirmed,
 * or a workout they were mid-log on can come here to pick any of them back
 * up (or clear it out) instead of only ever rediscovering it by accident on
 * whichever page it belongs to.
 */
@Component({
  selector: 'app-my-drafts',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
  templateUrl: './my-drafts.component.html',
})
export class MyDraftsComponent implements OnInit {

  drafts: DraftEntry[] = [];

  constructor(
    private draftService: DraftService,
    private router: Router,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.drafts = this.draftService.list();
  }

  resume(draft: DraftEntry): void {
    this.router.navigate([draft.route], { queryParams: draft.queryParams });
  }

  discard(draft: DraftEntry): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: `discard this ${draft.label.toLowerCase()} draft? This can't be undone.`,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.draftService.discard(draft.type, draft.id);
      this.drafts = this.drafts.filter(d => !(d.type === draft.type && d.id === draft.id));
      dialogRef.close();
    });
  }

  trackByDraft(_: number, draft: DraftEntry): string {
    return `${draft.type}:${draft.id}`;
  }
}
