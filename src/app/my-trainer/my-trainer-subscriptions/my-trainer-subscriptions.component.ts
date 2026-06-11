import { DatePipe } from '@angular/common';
import {
  ChangeDetectorRef, Component, Input,
  OnDestroy, OnInit
} from '@angular/core';
import { Subscription } from 'rxjs';
import { TrainerSubscription, Trainers } from 'src/app/models/trainers.interface';
import { TrainerStateService } from 'src/app/services/trainer-state.service';

// Map backend enum values to human-readable labels
const PLAN_LABELS: Record<string, string> = {
  MONTH_TO_MONTH: 'Month to Month',
  QUARTERLY: '3 Months',
  HALF_YEAR: '6 Months',
  ONE_YEAR: '1 Year',
  THREE_YEARS: '3 Years',
  FIVE_YEARS: '5 Years',
};

@Component({
  selector: 'app-my-trainer-subscriptions',
  templateUrl: './my-trainer-subscriptions.component.html',
  styleUrls: ['./my-trainer-subscriptions.component.css']
})
export class MyTrainerSubscriptionsComponent implements OnInit, OnDestroy {

  @Input() trainerSubscription!: TrainerSubscription;
  @Input() trainer!: Trainers;

  showModal = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private trainerStateService: TrainerStateService,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // If not passed in via @Input (e.g. standalone usage), load it ourselves
    if (!this.trainerSubscription) {
      this.loadSubscription();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private loadSubscription(): void {
    this.subscriptions.push(
      this.trainerStateService.getMyTrainerSubscription().subscribe({
        next: (sub) => {
          this.trainerSubscription = sub ?? null;
          this.cdr.detectChanges();
        },
        error: () => {
          this.cdr.detectChanges();
        }
      })
    );
  }

  get hasActiveSubscription(): boolean {
    if (!this.trainerSubscription) return false;
    return this.trainerSubscription.status?.toLowerCase() === 'active' &&
      new Date(this.trainerSubscription.endDate) > new Date();

  }

  // Called after modal saves successfully
  onSubscriptionSaved(): void {
    this.showModal = false;
    this.loadSubscription();
  }

  planLabel(tier: string): string {
    return PLAN_LABELS[tier] ?? tier ?? '—';
  }

  formatDate(date: any): string {
    if (!date) return '—';
    return this.datePipe.transform(new Date(date), 'dd MMM yyyy') ?? '—';
  }
}