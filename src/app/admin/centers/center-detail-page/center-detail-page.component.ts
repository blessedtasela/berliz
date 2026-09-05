import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { Centers } from 'src/app/models/centers.interface';
import { loadCenters } from 'src/app/state/center/center.actions';
import { selectCenters } from 'src/app/state/center/center.selectors';
import { AdminAvailabilityModalComponent } from 'src/app/admin/availability/admin-availability-modal/admin-availability-modal.component';

/**
 * Routed detail page for a single center — `/dashboard/centers/:id`
 * (also reachable via `/dashboard/hub/centers/:id`, same lazy module).
 *
 * Replaces the old CenterDetailsModalComponent dialog. Content is ported
 * as-is from that modal. The centers service has no get-by-id endpoint, so
 * this looks the center up in the already-loaded `centers` slice and, if
 * empty (direct link / refresh), dispatches `loadCenters()` and waits for
 * the store to populate.
 */
@Component({
  selector: 'app-center-detail-page',
  templateUrl: './center-detail-page.component.html',
  styleUrls: ['./center-detail-page.component.css']
})
export class CenterDetailPageComponent implements OnInit, OnDestroy {
  centerData: Centers | null = null;
  loading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private datePipe: DatePipe,
    private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = Number(params.get('id'));
        if (!id || Number.isNaN(id)) {
          this.loading = false;
          this.centerData = null;
          return;
        }
        this.loadCenter(id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCenter(id: number): void {
    this.loading = true;
    let dispatched = false;
    this.store.select(selectCenters)
      .pipe(takeUntil(this.destroy$))
      .subscribe(centers => {
        const found = (centers || []).find(center => center.id === id);
        if (found) {
          this.centerData = found;
          this.loading = false;
        } else if (!centers || centers.length === 0) {
          if (!dispatched) {
            dispatched = true;
            this.store.dispatch(loadCenters());
          }
        } else {
          this.centerData = null;
          this.loading = false;
        }
      });
  }

  openUrl(url: any) {
    window.open(url, '_blank');
  }

  openAvailability(): void {
    if (!this.centerData) return;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '560px';
    dialogConfig.maxWidth = '95vw';
    dialogConfig.maxHeight = '90vh';
    dialogConfig.data = { centerId: this.centerData.id, name: this.centerData.name };
    this.dialog.open(AdminAvailabilityModalComponent, dialogConfig);
  }

  formatDate(dateString: any): any {
    if (!dateString) return '';
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}
