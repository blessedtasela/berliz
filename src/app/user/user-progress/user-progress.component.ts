import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, Subscription, takeUntil } from 'rxjs';

import { ProgressEntry, ProgressEntryPhotoRequest } from 'src/app/models/progress-entry.model';
import { StrapiService } from 'src/app/services/strapi.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { imageValidator, genericError } from 'src/validators/form-validators.module';

import * as ProgressEntryActions from 'src/app/state/progress-entry/progress-entry.actions';
import { selectMyProgressEntries, selectProgressEntryError, selectProgressEntryLoading } from 'src/app/state/progress-entry/progress-entry.selectors';

interface PhotoSlot {
  file: File | null;
  uploading: boolean;
  error: string | null;
  uploaded: ProgressEntryPhotoRequest | null;
}

const MAX_NEW_ENTRY_PHOTOS = 3;

/**
 * Client's own "my progress" page — log a body-metric check-in (weight,
 * body fat %, up to 3 photos) and browse/edit/delete past entries.
 * A trainer with an active ProgressShare grant sees the same data read-only
 * via MyTrainerSharedProgressComponent.
 */
@Component({
  selector: 'app-user-progress',
  templateUrl: './user-progress.component.html',
  styleUrls: ['./user-progress.component.css']
})
export class UserProgressComponent implements OnInit, OnDestroy {

  entries: ProgressEntry[] = [];
  loading = true;

  // ── New entry form ─────────────────────────────────────────────────────
  weightKg: number | null = null;
  bodyFatPercent: number | null = null;
  date: string = new Date().toISOString().slice(0, 10);
  saving = false;

  newEntryPhotoSlots: PhotoSlot[] = Array.from({ length: MAX_NEW_ENTRY_PHOTOS }, () => this.emptySlot());

  // ── Inline edit ────────────────────────────────────────────────────────
  editingId: number | null = null;
  editWeightKg: number | null = null;
  editBodyFatPercent: number | null = null;
  editDate: string = '';

  /** Per-entry "adding a photo to an existing entry" upload state, keyed by entry id. */
  addingPhotoFor: Record<number, PhotoSlot> = {};

  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private strapiService: StrapiService,
    private snackBar: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.store.dispatch(ProgressEntryActions.loadMyProgressEntries());

    this.subscriptions.push(
      this.store.select(selectMyProgressEntries).pipe(takeUntil(this.destroy$)).subscribe(entries => this.entries = entries),
      this.store.select(selectProgressEntryLoading).pipe(takeUntil(this.destroy$)).subscribe(loading => this.loading = loading),
      this.store.select(selectProgressEntryError).pipe(takeUntil(this.destroy$)).subscribe(error => {
        if (error) this.snackBar.openSnackBar(error || genericError, 'error');
      }),
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  refresh(): void {
    this.store.dispatch(ProgressEntryActions.loadMyProgressEntries());
  }

  private emptySlot(): PhotoSlot {
    return { file: null, uploading: false, error: null, uploaded: null };
  }

  // ── New entry: photo upload ───────────────────────────────────────────
  onNewEntryFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    if (!file) return;

    const validationError = imageValidator()({ value: file } as any);
    if (validationError) {
      this.newEntryPhotoSlots[index].error = validationError['invalidType']
        ? 'Please upload a JPEG, PNG or WebP image'
        : 'Image must be under 5MB';
      return;
    }

    const slot = this.newEntryPhotoSlots[index];
    slot.error = null;
    slot.uploading = true;
    slot.file = file;

    this.strapiService.uploadToStrapi(file).subscribe({
      next: (res) => {
        slot.uploading = false;
        const uploaded = res?.[0];
        if (!uploaded?.url) {
          slot.error = 'Upload failed — no file returned';
          return;
        }
        slot.uploaded = {
          strapiId: uploaded.id,
          photoUrl: uploaded.url,
          name: uploaded.name,
          mimeType: uploaded.mime,
          byteSize: uploaded.size,
        };
      },
      error: () => {
        slot.uploading = false;
        slot.error = 'Upload failed — try again';
      }
    });
  }

  removeNewEntryPhotoSlot(index: number): void {
    this.newEntryPhotoSlots[index] = this.emptySlot();
  }

  // ── New entry: submit ─────────────────────────────────────────────────
  get canSaveNewEntry(): boolean {
    const hasPhoto = this.newEntryPhotoSlots.some(s => !!s.uploaded);
    return (this.weightKg != null || this.bodyFatPercent != null || hasPhoto) && !this.saving;
  }

  saveNewEntry(): void {
    if (!this.canSaveNewEntry) return;

    this.saving = true;
    const photos = this.newEntryPhotoSlots.filter(s => !!s.uploaded).map(s => s.uploaded as ProgressEntryPhotoRequest);

    this.store.dispatch(ProgressEntryActions.createProgressEntry({
      request: {
        weightKg: this.weightKg,
        bodyFatPercent: this.bodyFatPercent,
        date: new Date(this.date),
        photos,
      }
    }));

    // Optimistic form reset — the effect either lands (myEntries updates via
    // the store subscription above) or fails (snackbar via a future toast on
    // the failure action); resetting immediately keeps the form usable for a
    // fast second entry rather than blocking on the round trip.
    this.weightKg = null;
    this.bodyFatPercent = null;
    this.date = new Date().toISOString().slice(0, 10);
    this.newEntryPhotoSlots = Array.from({ length: MAX_NEW_ENTRY_PHOTOS }, () => this.emptySlot());
    this.saving = false;
  }

  // ── Existing entry: edit ──────────────────────────────────────────────
  startEdit(entry: ProgressEntry): void {
    this.editingId = entry.id;
    this.editWeightKg = entry.weightKg;
    this.editBodyFatPercent = entry.bodyFatPercent;
    this.editDate = new Date(entry.date).toISOString().slice(0, 10);
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  saveEdit(entry: ProgressEntry): void {
    this.store.dispatch(ProgressEntryActions.updateProgressEntry({
      entryId: entry.id,
      request: {
        weightKg: this.editWeightKg,
        bodyFatPercent: this.editBodyFatPercent,
        date: new Date(this.editDate),
      }
    }));
    this.editingId = null;
  }

  deleteEntry(entry: ProgressEntry): void {
    this.store.dispatch(ProgressEntryActions.deleteProgressEntry({ entryId: entry.id }));
  }

  // ── Existing entry: add/remove photo ──────────────────────────────────
  onExistingEntryFileSelected(event: Event, entry: ProgressEntry): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    if (!file) return;

    const validationError = imageValidator()({ value: file } as any);
    const slot = this.addingPhotoFor[entry.id] ?? this.emptySlot();
    this.addingPhotoFor[entry.id] = slot;

    if (validationError) {
      slot.error = validationError['invalidType']
        ? 'Please upload a JPEG, PNG or WebP image'
        : 'Image must be under 5MB';
      return;
    }

    slot.error = null;
    slot.uploading = true;

    this.strapiService.uploadToStrapi(file).subscribe({
      next: (res) => {
        slot.uploading = false;
        const uploaded = res?.[0];
        if (!uploaded?.url) {
          slot.error = 'Upload failed — no file returned';
          return;
        }
        this.store.dispatch(ProgressEntryActions.addProgressEntryPhoto({
          entryId: entry.id,
          photo: {
            strapiId: uploaded.id,
            photoUrl: uploaded.url,
            name: uploaded.name,
            mimeType: uploaded.mime,
            byteSize: uploaded.size,
          }
        }));
        delete this.addingPhotoFor[entry.id];
      },
      error: () => {
        slot.uploading = false;
        slot.error = genericError;
      }
    });
  }

  removePhoto(entry: ProgressEntry, photoId: number): void {
    this.store.dispatch(ProgressEntryActions.removeProgressEntryPhoto({ entryId: entry.id, photoId }));
  }
}
