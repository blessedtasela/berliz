import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { Trainers } from 'src/app/models/trainers.interface';
import { loadTrainers } from 'src/app/state/trainer/trainer.actions';
import { selectTrainers } from 'src/app/state/trainer/trainer.selector';
import { AdminAvailabilityModalComponent } from 'src/app/admin/availability/admin-availability-modal/admin-availability-modal.component';

/**
 * Routed detail page for a single trainer — `/dashboard/trainers/:id`
 * (also reachable via `/dashboard/hub/trainers/:id`, same lazy module).
 *
 * Replaces the old TrainerDetailsModalComponent dialog. Looks the trainer
 * up in the already-loaded `trainers` slice and dispatches `loadTrainers()`
 * if empty (direct link / refresh).
 */
@Component({
  selector: 'app-trainer-detail-page',
  templateUrl: './trainer-detail-page.component.html',
  styleUrls: ['./trainer-detail-page.component.css']
})
export class TrainerDetailPageComponent implements OnInit, OnDestroy {
  trainerData: Trainers | null = null;
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
          this.trainerData = null;
          return;
        }
        this.loadTrainer(id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTrainer(id: number): void {
    this.loading = true;
    let dispatched = false;
    this.store.select(selectTrainers)
      .pipe(takeUntil(this.destroy$))
      .subscribe(trainers => {
        const found = (trainers || []).find(trainer => trainer.id === id);
        if (found) {
          this.trainerData = found;
          this.loading = false;
        } else if (!trainers || trainers.length === 0) {
          if (!dispatched) {
            dispatched = true;
            this.store.dispatch(loadTrainers());
          }
        } else {
          this.trainerData = null;
          this.loading = false;
        }
      });
  }

  openUrl(url: any) {
    window.open(url, '_blank');
  }

  openAvailability(): void {
    if (!this.trainerData) return;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '560px';
    dialogConfig.maxWidth = '95vw';
    dialogConfig.maxHeight = '90vh';
    dialogConfig.data = { trainerId: this.trainerData.id, name: this.trainerData.name };
    this.dialog.open(AdminAvailabilityModalComponent, dialogConfig);
  }

  formatDate(dateString: any): any {
    if (!dateString) return '';
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}
