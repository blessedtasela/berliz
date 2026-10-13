import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { IconsModule } from 'src/app/icons/icons.module';
import { CalendarFeed, CalendarFeedService } from 'src/app/services/calendar-feed.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';

/**
 * "Put my Berliz sessions in my calendar": a private subscription link (iCalendar) that Google, Apple and
 * Outlook calendars poll, so confirmed sessions appear and move on their own. The link is the credential, so
 * it can be replaced -- the old one stops working at once.
 */
@Component({
  selector: 'app-calendar-feed-card',
  imports: [CommonModule, IconsModule, MatDialogModule],
  template: `
    <section class="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex flex-col gap-3 font-sans">
      <div class="flex items-start gap-3">
        <div class="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 flex items-center justify-center shrink-0">
          <i-feather name="calendar" class="text-red-600" style="width:16px;height:16px;"></i-feather>
        </div>
        <div>
          <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100">Add to your calendar</h3>
          <p class="text-[11px] text-gray-400 dark:text-gray-500">Your confirmed sessions show up in Google, Apple or Outlook Calendar and stay up to date.</p>
        </div>
      </div>

      <div *ngIf="loading" class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-2">
        <i-feather name="loader" class="animate-spin" style="width:13px;height:13px;"></i-feather> Getting your link…
      </div>

      <p *ngIf="failed" class="text-xs text-red-600">Couldn't get your calendar link.
        <button type="button" (click)="load()" class="underline font-semibold">Try again</button></p>

      <ng-container *ngIf="feed">
        <input type="text" readonly [value]="url" aria-label="Your private calendar link" (focus)="$any($event.target).select()"
          class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-[11px] text-gray-600 dark:text-gray-300 font-mono" />
        <div class="flex flex-wrap gap-2">
          <button type="button" (click)="copy()"
            class="px-3 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-1.5">
            <i-feather name="copy" style="width:12px;height:12px;"></i-feather> Copy link
          </button>
          <a [href]="webcalUrl"
            class="px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-1.5">
            <i-feather name="external-link" style="width:12px;height:12px;"></i-feather> Open in calendar app
          </a>
          <button type="button" (click)="confirmRotate()" [disabled]="rotating"
            class="px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-red-600 transition flex items-center gap-1.5 disabled:opacity-50">
            <i-feather name="refresh-cw" [ngClass]="{'animate-spin': rotating}" style="width:12px;height:12px;"></i-feather> Make a new link
          </button>
        </div>
        <p class="text-[11px] text-gray-400 dark:text-gray-500">Anyone with this link can see your session times, so don't share it. In Google Calendar choose "Other calendars", then "From URL".</p>
      </ng-container>
    </section>
  `
})
export class CalendarFeedCardComponent implements OnInit {

  feed: CalendarFeed | null = null;
  loading = false;
  failed = false;
  rotating = false;

  constructor(
    private calendarFeed: CalendarFeedService,
    private snackBar: SnackBarService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.load();
  }

  get url(): string {
    return this.feed ? this.calendarFeed.fullUrl(this.feed) : '';
  }

  /** webcal:// opens the user's default calendar app and subscribes in one tap. */
  get webcalUrl(): string {
    return this.url.replace(/^https?:\/\//, 'webcal://');
  }

  load(): void {
    this.loading = true;
    this.failed = false;
    this.calendarFeed.myFeed().subscribe({
      next: res => {
        this.loading = false;
        this.feed = res?.data ?? null;
        this.failed = !this.feed;
      },
      error: () => {
        this.loading = false;
        this.failed = true;
      }
    });
  }

  async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.url);
      this.snackBar.openSnackBar('Calendar link copied', '');
    } catch {
      this.snackBar.openSnackBar('Select the link above and copy it', 'error');
    }
  }

  confirmRotate(): void {
    this.dialog.open(PromptModalComponent, {
      width: '400px',
      maxWidth: '95vw',
      data: {
        confirmation: true,
        title: 'Make a new calendar link?',
        message: 'The current link stops working. You will need to add the new one to your calendar app.',
        confirmText: 'Make new link',
        cancelText: 'Keep current',
        icon: 'refresh-cw'
      }
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) this.rotate();
    });
  }

  private rotate(): void {
    this.rotating = true;
    this.calendarFeed.rotate().subscribe({
      next: res => {
        this.rotating = false;
        if (res?.data) this.feed = res.data;
        this.snackBar.openSnackBar('New calendar link ready', '');
      },
      error: err => {
        this.rotating = false;
        this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
      }
    });
  }
}
