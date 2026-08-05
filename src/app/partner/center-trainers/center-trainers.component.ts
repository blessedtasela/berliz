import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, take } from 'rxjs';
import { Centers, CenterTrainers } from 'src/app/models/centers.interface';
import { CenterService } from 'src/app/services/center.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { loadMyCenterTrainers } from 'src/app/state/center/center.actions';
import { selectMyCenterTrainers } from 'src/app/state/center/center.selectors';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-center-trainers',
  templateUrl: './center-trainers.component.html',
  styleUrls: ['./center-trainers.component.css']
})
export class CenterTrainersComponent implements OnInit, OnChanges, OnDestroy {

  @Input() center!: Centers | null;
  @Output() emitEvent = new EventEmitter();

  centerTrainers: CenterTrainers[] = [];
  addTrainerForm!: FormGroup;

  showEditor = false;
  invalidForm = false;
  originalValue: any;

  showAll = false;
  visibleCount = 8;

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private loader: NgxUiLoaderService,
    private snackbar: SnackBarService,
    private centerService: CenterService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    if (!this.addTrainerForm) {
      this.initForm();
    }
    this.handleEmitEvent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['center']?.currentValue && this.addTrainerForm) {
      this.addTrainerForm.patchValue({ centerId: this.center?.id });
      this.originalValue = this.addTrainerForm.getRawValue();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  handleEmitEvent(): void {
    this.store.dispatch(loadMyCenterTrainers());
    this.subscriptions.push(
      this.store.select(selectMyCenterTrainers).subscribe(trainers => {
        this.centerTrainers = trainers ?? [];
      })
    );
  }

  private initForm(): void {
    this.addTrainerForm = this.fb.group({
      centerId: [this.center?.id ?? null],
      trainerId: [null, [Validators.required, Validators.min(1)]],
    });

    this.addTrainerForm.markAsPristine();
    this.addTrainerForm.markAsUntouched();
    this.originalValue = this.addTrainerForm.getRawValue();
  }

  get visibleTrainers(): CenterTrainers[] {
    return this.showAll ? this.centerTrainers : this.centerTrainers.slice(0, this.visibleCount);
  }

  get activeCount(): number {
    return this.centerTrainers.filter(t => this.isActive(t.status)).length;
  }

  isActive(status: string): boolean {
    return status?.toLowerCase() === 'true' || status?.toLowerCase() === 'active';
  }

  hasChanges(): boolean {
    if (!this.addTrainerForm) return false;
    return JSON.stringify(this.addTrainerForm.getRawValue()) !== JSON.stringify(this.originalValue);
  }

  toggleEditor(): void {
    this.showEditor = !this.showEditor;
    this.invalidForm = false;
    this.initForm();
  }

  addTrainer(): void {
    if (this.addTrainerForm.invalid) {
      this.invalidForm = true;
      this.addTrainerForm.markAllAsTouched();
      this.snackbar.openSnackBar('Please provide a valid trainer id', 'error');
      return;
    }

    this.loader.start();
    this.centerService.addCenterTrainer(this.addTrainerForm.getRawValue()).pipe(take(1)).subscribe({
      next: (response: any) => {
        this.snackbar.openSnackBar(response?.message || 'Trainer added', '');
        this.store.dispatch(loadMyCenterTrainers());
        this.emitEvent.emit();
        this.showEditor = false;
        this.invalidForm = false;
        this.initForm();
        this.loader.stop();
      },
      error: (err: any) => {
        this.snackbar.openSnackBar(err?.error?.message || genericError, 'error');
        this.loader.stop();
      }
    });
  }

  toggleStatus(trainer: CenterTrainers): void {
    this.loader.start();
    this.centerService.updateCenterTrainerStatus(trainer.id).pipe(take(1)).subscribe({
      next: (response: any) => {
        this.snackbar.openSnackBar(response?.message || 'Trainer status updated', '');
        this.store.dispatch(loadMyCenterTrainers());
        this.emitEvent.emit();
        this.loader.stop();
      },
      error: (err: any) => {
        this.snackbar.openSnackBar(err?.error?.message || genericError, 'error');
        this.loader.stop();
      }
    });
  }

  removeTrainer(trainer: CenterTrainers): void {
    this.loader.start();
    this.centerService.deleteCenterTrainer(trainer.id).pipe(take(1)).subscribe({
      next: (response: any) => {
        this.snackbar.openSnackBar(response?.message || 'Trainer removed', '');
        this.store.dispatch(loadMyCenterTrainers());
        this.emitEvent.emit();
        this.loader.stop();
      },
      error: (err: any) => {
        this.snackbar.openSnackBar(err?.error?.message || genericError, 'error');
        this.loader.stop();
      }
    });
  }

  formatDate(date: any): string {
    return this.datePipe.transform(new Date(date), 'dd MMM yyyy') ?? '—';
  }
}
