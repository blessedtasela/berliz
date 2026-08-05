import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, take } from 'rxjs';
import { Centers, CenterLocations } from 'src/app/models/centers.interface';
import { CenterService } from 'src/app/services/center.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { loadMyCenterLocations } from 'src/app/state/center/center.actions';
import { selectMyCenterLocations } from 'src/app/state/center/center.selectors';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-center-locations',
  templateUrl: './center-locations.component.html',
  styleUrls: ['./center-locations.component.css']
})
export class CenterLocationsComponent implements OnInit, OnChanges, OnDestroy {

  @Input() center!: Centers | null;
  @Output() emitEvent = new EventEmitter();

  centerLocations: CenterLocations[] = [];
  locationForm!: FormGroup;

  showEditor = false;
  editingId: number | null = null;
  invalidForm = false;
  originalValue: any;

  showAll = false;
  visibleCount = 4;

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
    if (!this.locationForm) {
      this.initForm();
    }
    this.handleEmitEvent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['center']?.currentValue && this.locationForm) {
      this.locationForm.patchValue({ centerId: this.center?.id });
      this.originalValue = this.locationForm.getRawValue();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  handleEmitEvent(): void {
    this.store.dispatch(loadMyCenterLocations());
    this.subscriptions.push(
      this.store.select(selectMyCenterLocations).subscribe(locations => {
        this.centerLocations = locations ?? [];
      })
    );
  }

  private initForm(location?: CenterLocations | null): void {
    this.locationForm = this.fb.group({
      id: [location?.id ?? null],
      centerId: [location?.centerId ?? this.center?.id ?? null],
      subName: [location?.subName ?? '', [Validators.required, Validators.minLength(3)]],
      address: [location?.address ?? '', [Validators.required, Validators.minLength(8)]],
      locationUrl: [location?.locationUrl ?? '', Validators.required],
      coverPhotoUrl: [location?.coverPhotoUrl ?? ''],
    });

    this.locationForm.markAsPristine();
    this.locationForm.markAsUntouched();
    this.originalValue = this.locationForm.getRawValue();
  }

  get visibleLocations(): CenterLocations[] {
    return this.showAll ? this.centerLocations : this.centerLocations.slice(0, this.visibleCount);
  }

  hasChanges(): boolean {
    if (!this.locationForm) return false;
    return JSON.stringify(this.locationForm.getRawValue()) !== JSON.stringify(this.originalValue);
  }

  openAdd(): void {
    this.editingId = null;
    this.invalidForm = false;
    this.initForm(null);
    this.showEditor = true;
  }

  openEdit(location: CenterLocations): void {
    this.editingId = location.id;
    this.invalidForm = false;
    this.initForm(location);
    this.showEditor = true;
  }

  closeEditor(): void {
    this.showEditor = false;
    this.editingId = null;
    this.invalidForm = false;
    this.initForm(null);
  }

  saveLocation(): void {
    if (this.locationForm.invalid) {
      this.invalidForm = true;
      this.locationForm.markAllAsTouched();
      this.snackbar.openSnackBar('Invalid form. Please complete all sections', 'error');
      return;
    }

    const payload = this.locationForm.getRawValue();

    this.loader.start();

    const request$ = payload.id
      ? this.centerService.updateLocation(payload)
      : this.centerService.addLocation(payload);

    request$.pipe(take(1)).subscribe({
      next: (response: any) => {
        this.snackbar.openSnackBar(response?.message || 'Saved successfully', '');
        this.store.dispatch(loadMyCenterLocations());
        this.emitEvent.emit();
        this.closeEditor();
        this.loader.stop();
      },
      error: (err: any) => {
        this.snackbar.openSnackBar(err?.error?.message || genericError, 'error');
        this.loader.stop();
      }
    });
  }

  deleteLocation(location: CenterLocations): void {
    this.loader.start();
    this.centerService.deleteLocation(location.id).pipe(take(1)).subscribe({
      next: (response: any) => {
        this.snackbar.openSnackBar(response?.message || 'Location removed', '');
        this.store.dispatch(loadMyCenterLocations());
        this.emitEvent.emit();
        this.loader.stop();
      },
      error: (err: any) => {
        this.snackbar.openSnackBar(err?.error?.message || genericError, 'error');
        this.loader.stop();
      }
    });
  }

  openUrl(url: string): void {
    if (url) window.open(url, '_blank');
  }

  formatDate(date: any): string {
    return this.datePipe.transform(new Date(date), 'dd/MM/yyyy') ?? '';
  }
}
