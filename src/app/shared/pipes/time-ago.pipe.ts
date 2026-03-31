import { Pipe, PipeTransform, ChangeDetectorRef, NgZone, OnDestroy } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  pure: false
})
export class TimeAgoPipe implements PipeTransform, OnDestroy {
  private timer: any;

  constructor(private cdRef: ChangeDetectorRef, private ngZone: NgZone) {
    this.startTimer();
  }

  transform(value: string | Date): string {
    if (!value) return '';

    const now = new Date();
    const past = new Date(value);

    let diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 0) return 'just now';
    if (diffInSeconds < 5) return 'just now';

    if (diffInSeconds < 60) {
      return `${diffInSeconds} sec ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hr ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInDays < 30) {
      return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }

  private startTimer() {
    if (this.timer) return;

    this.ngZone.runOutsideAngular(() => {
      this.timer = setInterval(() => {
        this.ngZone.run(() => this.cdRef.markForCheck());
      }, 60000); // update every minute
    });
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}