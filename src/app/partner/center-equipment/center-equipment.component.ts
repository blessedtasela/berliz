import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, take } from 'rxjs';
import { Centers, CenterEquipment } from 'src/app/models/centers.interface';
import { CenterService } from 'src/app/services/center.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { loadMyCenterEquipment } from 'src/app/state/center/center.actions';
import { selectMyCenterEquipment } from 'src/app/state/center/center.selectors';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-center-equipment',
  templateUrl: './center-equipment.component.html',
  styleUrls: ['./center-equipment.component.css']
})
export class CenterEquipmentComponent implements OnInit, OnChanges, OnDestroy {

  @Input() center!: Centers | null;
  @Output() emitEvent = new EventEmitter();

  centerEquipment: CenterEquipment[] = [];
  equipmentForm!: FormGroup;

  showEditor = false;
  editingId: number | null = null;
  invalidForm = false;
  originalValue: any;

  showAll = false;
  visibleCount = 6;

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
    if (!this.equipmentForm) {
      this.initForm();
    }
    this.handleEmitEvent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['center']?.currentValue && this.equipmentForm) {
      this.equipmentForm.patchValue({ centerId: this.center?.id });
      this.originalValue = this.equipmentForm.getRawValue();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  handleEmitEvent(): void {
    this.store.dispatch(loadMyCenterEquipment());
    this.subscriptions.push(
      this.store.select(selectMyCenterEquipment).subscribe(equipment => {
        this.centerEquipment = equipment ?? [];
      })
    );
  }

  private initForm(equipment?: CenterEquipment | null): void {
    this.equipmentForm = this.fb.group({
      id: [equipment?.id ?? null],
      centerId: [equipment?.centerId ?? this.center?.id ?? null],
      name: [equipment?.name ?? '', [Validators.required, Validators.minLength(3)]],
      description: [equipment?.description ?? '', [Validators.required, Validators.minLength(15)]],
      stockNumber: [equipment?.stockNumber ?? null, [Validators.required, Validators.min(1)]],
      imageUrl: [equipment?.imageUrl ?? ''],
      frontViewUrl: [equipment?.frontViewUrl ?? ''],
      sideViewUrl: [equipment?.sideViewUrl ?? ''],
      rearViewUrl: [equipment?.rearViewUrl ?? ''],
    });

    this.equipmentForm.markAsPristine();
    this.equipmentForm.markAsUntouched();
    this.originalValue = this.equipmentForm.getRawValue();
  }

  get visibleEquipment(): CenterEquipment[] {
    return this.showAll ? this.centerEquipment : this.centerEquipment.slice(0, this.visibleCount);
  }

  hasChanges(): boolean {
    if (!this.equipmentForm) return false;
    return JSON.stringify(this.equipmentForm.getRawValue()) !== JSON.stringify(this.originalValue);
  }

  openAdd(): void {
    this.editingId = null;
    this.invalidForm = false;
    this.initForm(null);
    this.showEditor = true;
  }

  openEdit(equipment: CenterEquipment): void {
    this.editingId = equipment.id;
    this.invalidForm = false;
    this.initForm(equipment);
    this.showEditor = true;
  }

  closeEditor(): void {
    this.showEditor = false;
    this.editingId = null;
    this.invalidForm = false;
    this.initForm(null);
  }

  saveEquipment(): void {
    if (this.equipmentForm.invalid) {
      this.invalidForm = true;
      this.equipmentForm.markAllAsTouched();
      this.snackbar.openSnackBar('Invalid form. Please complete all sections', 'error');
      return;
    }

    const payload = this.equipmentForm.getRawValue();

    this.loader.start();

    const request$ = payload.id
      ? this.centerService.updateEquipment(payload)
      : this.centerService.addEquipment(payload);

    request$.pipe(take(1)).subscribe({
      next: (response: any) => {
        this.snackbar.openSnackBar(response?.message || 'Saved successfully', '');
        this.store.dispatch(loadMyCenterEquipment());
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

  toggleFeatured(equipment: CenterEquipment): void {
    this.loader.start();
    this.centerService.updateEquipmentFeatured(equipment.id).pipe(take(1)).subscribe({
      next: (response: any) => {
        this.snackbar.openSnackBar(response?.message || 'Updated successfully', '');
        this.store.dispatch(loadMyCenterEquipment());
        this.loader.stop();
      },
      error: (err: any) => {
        this.snackbar.openSnackBar(err?.error?.message || genericError, 'error');
        this.loader.stop();
      }
    });
  }

  deleteEquipment(equipment: CenterEquipment): void {
    this.loader.start();
    this.centerService.deleteEquipment(equipment.id).pipe(take(1)).subscribe({
      next: (response: any) => {
        this.snackbar.openSnackBar(response?.message || 'Equipment removed', '');
        this.store.dispatch(loadMyCenterEquipment());
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
    return this.datePipe.transform(new Date(date), 'dd/MM/yyyy') ?? '';
  }
}
