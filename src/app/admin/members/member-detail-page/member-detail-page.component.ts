import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { Members } from 'src/app/models/members.interface';
import { loadMembers } from 'src/app/state/member/member.actions';
import { selectMembers } from 'src/app/state/member/member.selectors';

/**
 * Routed detail page for a single member — `/dashboard/members/:id`
 * (also reachable via `/dashboard/hub/members/:id`, same lazy module).
 *
 * Replaces the old MemberDetailsModalComponent dialog. Looks the member up
 * in the already-loaded `members` slice and dispatches `loadMembers()` if
 * it is empty (direct link / refresh).
 */
@Component({
  selector: 'app-member-detail-page',
  templateUrl: './member-detail-page.component.html',
  styleUrls: ['./member-detail-page.component.css']
})
export class MemberDetailPageComponent implements OnInit, OnDestroy {
  memberData: Members | null = null;
  loading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = Number(params.get('id'));
        if (!id || Number.isNaN(id)) {
          this.loading = false;
          this.memberData = null;
          return;
        }
        this.loadMember(id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMember(id: number): void {
    this.loading = true;
    let dispatched = false;
    this.store.select(selectMembers)
      .pipe(takeUntil(this.destroy$))
      .subscribe(members => {
        const found = (members || []).find(member => member.id === id);
        if (found) {
          this.memberData = found;
          this.loading = false;
        } else if (!members || members.length === 0) {
          if (!dispatched) {
            dispatched = true;
            this.store.dispatch(loadMembers());
          }
        } else {
          this.memberData = null;
          this.loading = false;
        }
      });
  }

  openUrl(url: any) {
    window.open(url, '_blank');
  }

  formatDate(dateString: any): any {
    if (!dateString) return '';
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}
