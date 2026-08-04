import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { CenterTrainers } from 'src/app/models/centers.interface';
import { loadTrainerCenterTrainers } from 'src/app/state/trainer/trainer.actions';
import { selectTrainerCenterTrainers } from 'src/app/state/trainer/trainer.selector';

@Component({
  selector: 'app-my-trainer-centers',
  templateUrl: './my-trainer-centers.component.html',
  styleUrls: ['./my-trainer-centers.component.css']
})
export class MyTrainerCentersComponent implements OnInit, OnDestroy {

  centerTrainers: CenterTrainers[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private store: Store,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  handleEmitEvent(): void {
    this.store.dispatch(loadTrainerCenterTrainers());
    this.subscriptions.push(
      this.store.select(selectTrainerCenterTrainers).subscribe(centerTrainers => {
        this.centerTrainers = centerTrainers ?? [];
      })
    );
  }

  isActive(status: string): boolean {
    return status?.toLowerCase() === 'true' || status?.toLowerCase() === 'active';
  }

  formatDate(date: any): string {
    return this.datePipe.transform(new Date(date), 'dd MMM yyyy') ?? '—';
  }
}
