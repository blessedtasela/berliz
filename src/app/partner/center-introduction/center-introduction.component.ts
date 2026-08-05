import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, take } from 'rxjs';
import { Centers, CenterIntroduction } from 'src/app/models/centers.interface';
import { CenterService } from 'src/app/services/center.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { loadMyCenterIntroductions } from 'src/app/state/center/center.actions';
import { selectMyCenterIntroductions } from 'src/app/state/center/center.selectors';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-center-introduction',
  templateUrl: './center-introduction.component.html',
  styleUrls: ['./center-introduction.component.css']
})
export class CenterIntroductionComponent implements OnInit, OnChanges, OnDestroy {

  @Input() center!: Centers | null;
  @Output() emitEvent = new EventEmitter();

  centerIntroduction: CenterIntroduction | null = null;
  updateCenterIntroductionForm!: FormGroup;

  invalidForm = false;
  originalValue: any;

  readonly MIN_LENGTH = 250;
  readonly MAX_LENGTH = 1200;

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
    if (!this.updateCenterIntroductionForm) {
      this.initForm();
    }
    this.handleEmitEvent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['center']?.currentValue && this.updateCenterIntroductionForm) {
      this.updateCenterIntroductionForm.patchValue({ centerId: this.center?.id });
      this.originalValue = this.updateCenterIntroductionForm.getRawValue();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  handleEmitEvent(): void {
    this.store.dispatch(loadMyCenterIntroductions());
    this.subscriptions.push(
      this.store.select(selectMyCenterIntroductions).subscribe(introductions => {
        this.centerIntroduction = introductions?.[0] ?? null;
        this.initForm();
      })
    );
  }

  private initForm(): void {
    if (this.updateCenterIntroductionForm) {
      this.updateCenterIntroductionForm.patchValue({
        id: this.centerIntroduction?.id ?? null,
        centerId: this.centerIntroduction?.centerId ?? this.center?.id ?? null,
        introduction: this.centerIntroduction?.introduction ?? ''
      });
    } else {
      this.updateCenterIntroductionForm = this.fb.group({
        id: [this.centerIntroduction?.id ?? null],
        centerId: [this.centerIntroduction?.centerId ?? this.center?.id ?? null],
        introduction: [
          this.centerIntroduction?.introduction ?? '',
          [
            Validators.required,
            Validators.minLength(this.MIN_LENGTH),
            Validators.maxLength(this.MAX_LENGTH)
          ]
        ]
      });
    }

    this.updateCenterIntroductionForm.markAsPristine();
    this.updateCenterIntroductionForm.markAsUntouched();
    this.originalValue = this.updateCenterIntroductionForm.getRawValue();
  }

  get introductionControl() {
    return this.updateCenterIntroductionForm.get('introduction');
  }

  get introductionLength(): number {
    return this.introductionControl?.value?.length || 0;
  }

  hasChanges(): boolean {
    if (!this.updateCenterIntroductionForm) return false;
    return JSON.stringify(this.updateCenterIntroductionForm.getRawValue())
      !== JSON.stringify(this.originalValue);
  }

  updateCenterIntroduction(): void {
    if (this.updateCenterIntroductionForm.invalid) {
      this.invalidForm = true;
      this.updateCenterIntroductionForm.markAllAsTouched();
      this.snackbar.openSnackBar('Invalid form. Please complete all sections', 'error');
      return;
    }

    const payload = this.updateCenterIntroductionForm.getRawValue();

    this.loader.start();

    const request$ = payload.id
      ? this.centerService.updateIntroduction(payload)
      : this.centerService.addIntroduction(payload);

    request$.pipe(take(1)).subscribe({
      next: (response: any) => {
        this.snackbar.openSnackBar(response?.message || 'Saved successfully', '');
        this.clear(response?.data ?? response);
        this.store.dispatch(loadMyCenterIntroductions());
        this.emitEvent.emit();
        this.loader.stop();
      },
      error: (err: any) => {
        this.snackbar.openSnackBar(err?.error?.message || genericError, 'error');
        this.loader.stop();
      }
    });
  }

  private clear(updated: CenterIntroduction): void {
    if (updated?.id) {
      this.centerIntroduction = updated;
    }

    this.updateCenterIntroductionForm.patchValue({
      id: updated?.id ?? this.updateCenterIntroductionForm.get('id')?.value,
      centerId: updated?.centerId ?? this.updateCenterIntroductionForm.get('centerId')?.value,
      introduction: updated?.introduction ?? this.updateCenterIntroductionForm.get('introduction')?.value
    });

    this.invalidForm = false;
    this.updateCenterIntroductionForm.markAsPristine();
    this.updateCenterIntroductionForm.markAsUntouched();
    this.updateCenterIntroductionForm.updateValueAndValidity();
    this.originalValue = this.updateCenterIntroductionForm.getRawValue();
  }

  formatDate(date: any): string {
    return this.datePipe.transform(new Date(date), 'dd/MM/yyyy') ?? '';
  }
}
