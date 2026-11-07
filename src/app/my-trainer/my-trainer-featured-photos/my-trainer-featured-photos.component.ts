import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { take } from 'rxjs';
import { TrainerFeaturedPhoto, TrainerPhotoAlbum } from 'src/app/models/trainers.interface';
import { PhotoResponse } from 'src/app/models/Media.interface';
import { TrainerService } from 'src/app/services/trainer.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';
import { resolveStrapiUrl } from 'src/app/utils/strapi-url.util';

const MAX_FEATURED = 4;

@Component({
  selector: 'app-my-trainer-featured-photos',
  templateUrl: './my-trainer-featured-photos.component.html',
  styleUrls: ['./my-trainer-featured-photos.component.css'],
  standalone: false
})
export class MyTrainerFeaturedPhotosComponent implements OnChanges {
  @Input() photoAlbum: TrainerPhotoAlbum | null = null;
  @Input() featuredPhotos: TrainerFeaturedPhoto[] = [];

  readonly MAX_FEATURED = MAX_FEATURED;

  /** Working set of picked photo ids -- only pushed to the backend on Save. */
  selectedIds: number[] = [];
  /** True once the trainer has changed the selection since the last load/save. */
  private dirty = false;

  saving = false;
  submitError: string | null = null;

  constructor(
    private trainerService: TrainerService,
    private snackbar: SnackBarService,
    private loader: NgxUiLoaderService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    // Don't clobber an in-progress, unsaved selection just because a sibling
    // store slice re-emitted (e.g. a websocket refresh of the whole page).
    if (changes['featuredPhotos'] && !this.dirty) {
      this.selectedIds = this.originalIds();
    }
  }

  private originalIds(): number[] {
    return [...(this.featuredPhotos || [])]
      .sort((a, b) => (a.position ?? 99) - (b.position ?? 99))
      .map(f => f.photo?.id)
      .filter((id): id is number => !!id);
  }

  get albumPhotos(): PhotoResponse[] {
    return this.photoAlbum?.photos || [];
  }

  get selectedPhotos(): PhotoResponse[] {
    return this.selectedIds
      .map(id => this.albumPhotos.find(p => p.id === id))
      .filter((p): p is PhotoResponse => !!p);
  }

  get canAddMore(): boolean {
    return this.selectedIds.length < MAX_FEATURED;
  }

  get hasChanges(): boolean {
    const original = this.originalIds();
    if (original.length !== this.selectedIds.length) return true;
    return original.some((id, i) => id !== this.selectedIds[i]);
  }

  isSelected(photoId: number): boolean {
    return this.selectedIds.includes(photoId);
  }

  toggle(photoId: number): void {
    this.submitError = null;
    this.dirty = true;
    if (this.isSelected(photoId)) {
      this.selectedIds = this.selectedIds.filter(id => id !== photoId);
      return;
    }
    if (!this.canAddMore) {
      this.submitError = `You can feature up to ${MAX_FEATURED} photos.`;
      return;
    }
    this.selectedIds = [...this.selectedIds, photoId];
  }

  photoUrl(photo: PhotoResponse): string {
    return resolveStrapiUrl(photo.photoUrl) || 'assets/avatar.png';
  }

  save(): void {
    if (!this.hasChanges) return;
    this.submitError = null;
    this.saving = true;
    this.loader.start();

    this.trainerService.updateMyFeaturedPhotos(this.selectedIds)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.featuredPhotos = res?.data ?? [];
          this.selectedIds = this.originalIds();
          this.dirty = false;
          this.snackbar.openSnackBar(res?.message || 'Featured photos updated', '');
          this.saving = false;
          this.loader.stop();
        },
        error: (err: any) => {
          this.submitError = err?.error?.message || genericError;
          this.saving = false;
          this.loader.stop();
        }
      });
  }
}
