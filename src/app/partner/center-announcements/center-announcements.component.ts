import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, take } from 'rxjs';
import { Centers, CenterAnnouncements } from 'src/app/models/centers.interface';
import { CenterService } from 'src/app/services/center.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { loadMyCenterAnnouncements } from 'src/app/state/center/center.actions';
import { selectMyCenterAnnouncements } from 'src/app/state/center/center.selectors';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-center-announcements',
  templateUrl: './center-announcements.component.html',
  styleUrls: ['./center-announcements.component.css']
})
export class CenterAnnouncementsComponent implements OnInit, OnChanges, OnDestroy {

  @Input() center!: Centers | null;
  @Output() emitEvent = new EventEmitter();

  centerAnnouncements: CenterAnnouncements[] = [];
  announcementForm!: FormGroup;

  showEditor = false;
  editingId: number | null = null;
  invalidForm = false;
  originalValue: any;

  showAll = false;
  visibleCount = 5;

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
    if (!this.announcementForm) {
      this.initForm();
    }
    this.handleEmitEvent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['center']?.currentValue && this.announcementForm) {
      this.announcementForm.patchValue({ centerId: this.center?.id });
      this.originalValue = this.announcementForm.getRawValue();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  handleEmitEvent(): void {
    this.store.dispatch(loadMyCenterAnnouncements());
    this.subscriptions.push(
      this.store.select(selectMyCenterAnnouncements).subscribe(announcements => {
        this.centerAnnouncements = announcements ?? [];
      })
    );
  }

  private initForm(announcement?: CenterAnnouncements | null): void {
    this.announcementForm = this.fb.group({
      id: [announcement?.id ?? null],
      centerId: [announcement?.centerId ?? this.center?.id ?? null],
      announcement: [
        announcement?.announcement ?? '',
        [Validators.required, Validators.minLength(15), Validators.maxLength(500)]
      ],
      iconUrl: [announcement?.iconUrl ?? ''],
    });

    this.announcementForm.markAsPristine();
    this.announcementForm.markAsUntouched();
    this.originalValue = this.announcementForm.getRawValue();
  }

  get visibleAnnouncements(): CenterAnnouncements[] {
    return this.showAll ? this.centerAnnouncements : this.centerAnnouncements.slice(0, this.visibleCount);
  }

  hasChanges(): boolean {
    if (!this.announcementForm) return false;
    return JSON.stringify(this.announcementForm.getRawValue()) !== JSON.stringify(this.originalValue);
  }

  isActive(status: string): boolean {
    return status?.toLowerCase() === 'true' || status?.toLowerCase() === 'active';
  }

  openAdd(): void {
    this.editingId = null;
    this.invalidForm = false;
    this.initForm(null);
    this.showEditor = true;
  }

  openEdit(announcement: CenterAnnouncements): void {
    this.editingId = announcement.id;
    this.invalidForm = false;
    this.initForm(announcement);
    this.showEditor = true;
  }

  closeEditor(): void {
    this.showEditor = false;
    this.editingId = null;
    this.invalidForm = false;
    this.initForm(null);
  }

  saveAnnouncement(): void {
    if (this.announcementForm.invalid) {
      this.invalidForm = true;
      this.announcementForm.markAllAsTouched();
      this.snackbar.openSnackBar('Invalid form. Please complete all sections', 'error');
      return;
    }

    const payload = this.announcementForm.getRawValue();

    this.loader.start();

    const request$ = payload.id
      ? this.centerService.updateAnnouncement(payload)
      : this.centerService.addAnnouncement(payload);

    request$.pipe(take(1)).subscribe({
      next: (response: any) => {
        this.snackbar.openSnackBar(response?.message || 'Saved successfully', '');
        this.store.dispatch(loadMyCenterAnnouncements());
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

  toggleStatus(announcement: CenterAnnouncements): void {
    this.loader.start();
    this.centerService.updateAnnouncementStatus(announcement.id).pipe(take(1)).subscribe({
      next: (response: any) => {
        this.snackbar.openSnackBar(response?.message || 'Announcement status updated', '');
        this.store.dispatch(loadMyCenterAnnouncements());
        this.emitEvent.emit();
        this.loader.stop();
      },
      error: (err: any) => {
        this.snackbar.openSnackBar(err?.error?.message || genericError, 'error');
        this.loader.stop();
      }
    });
  }

  deleteAnnouncement(announcement: CenterAnnouncements): void {
    this.loader.start();
    this.centerService.deleteAnnouncement(announcement.id).pipe(take(1)).subscribe({
      next: (response: any) => {
        this.snackbar.openSnackBar(response?.message || 'Announcement removed', '');
        this.store.dispatch(loadMyCenterAnnouncements());
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
