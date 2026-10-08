import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { Trainers, TrainerLikes } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';
import { TrainerService } from 'src/app/services/trainer.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { resolveStrapiUrl } from 'src/app/utils/strapi-url.util';
import { genericError } from 'src/validators/form-validators.module';
import { TrainerPartnerFormComponent } from '../trainer-partner-form/trainer-partner-form.component';
import { MatDialog } from '@angular/material/dialog';
import { PartnerFormComponent } from 'src/app/shared/partner-form/partner-form.component';
import { Store } from '@ngrx/store';
import { selectUser } from 'src/app/state/user/user.selector';
import { selectCurrentTrainer, selectTrainerLikes } from 'src/app/state/trainer/trainer.selector';
import { loadTrainerLikes } from 'src/app/state/trainer/trainer.actions';
import { AuthRedirectService } from 'src/app/services/auth-redirect.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { DEFAULT_PROVIDER_CRITERIA, ProviderFilterCriteria, applyProviderFilters } from 'src/app/shared/provider-profile/provider-filters';


@Component({
    selector: 'app-trainers-search-result',
    templateUrl: './trainers-search-result.component.html',
    styleUrls: ['./trainers-search-result.component.css'],
    standalone: false
})
export class TrainersSearchResultComponent implements OnInit, OnDestroy {

  private _trainersResult: Trainers[] = [];

  /** The list after the page's text search; filters and sorting are applied on top of it here. */
  @Input() set trainersResult(value: Trainers[]) {
    this._trainersResult = value ?? [];
    this.recompute();
  }
  get trainersResult(): Trainers[] { return this._trainersResult; }

  criteria: ProviderFilterCriteria = { ...DEFAULT_PROVIDER_CRITERIA };
  /** trainersResult with the filters and sort applied -- what the grid shows. */
  shown: Trainers[] = [];

  private recompute(): void {
    this.shown = applyProviderFilters(this._trainersResult, this.criteria);
  }

  onCriteria(criteria: ProviderFilterCriteria): void {
    this.criteria = criteria;
    this.showAll = false;
    this.recompute();
  }

  resetCriteria(): void {
    this.onCriteria({ ...DEFAULT_PROVIDER_CRITERIA });
  }

  readonly PAGE_SIZE = 12;

  showAll = false;

  photoUrl(trainer: Trainers): string {
    return resolveStrapiUrl(trainer?.photoResponse?.photoUrl) || 'assets/avatar.png';
  }

  get visibleCount() {
    return this.showAll
      ? this.shown.length
      : Math.min(this.PAGE_SIZE, this.shown.length);
  }

  user!: Users | null;
  trainerLikes: TrainerLikes[] = [];

  /** trainerIds flipped locally, pending backend reconciliation — makes the heart fill instantly */
  private optimisticLikes = new Set<number>();

  private subs: Subscription[] = [];

  constructor(
    private store: Store,
    private trainerService: TrainerService,
    private snackbar: SnackBarService,
    private dialog: MatDialog,
    private authRedirect: AuthRedirectService,
  ) { }

  ngOnInit(): void {
    // User
    this.subs.push(this.store.select(selectUser).subscribe(u => this.user = u));

    // Likes cache
    this.store.dispatch(loadTrainerLikes());
    this.subs.push(
      this.store.select(selectTrainerLikes).subscribe(cached => {
        this.trainerLikes = cached;
        // Fresh truth arrived from the backend — drop any optimistic overrides.
        this.optimisticLikes.clear();
      })
    );





    this.visibleCount; // trigger getter for initial value
  }

  openPartnerForm(): void {
    const userEmail = this.user?.email;

    if (!userEmail) {
      const loginDialogRef = this.dialog.open(PromptModalComponent, {
        width: '400px',
        maxWidth: '95vw',
        data: {
          confirmation: true,
          title: 'Login required',
          message: 'You need to be logged in to apply as a trainer. Log in to continue?',
          confirmText: 'Log in',
          cancelText: 'Cancel',
          icon: 'log-in'
        }
      });

      loginDialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.authRedirect.goToLogin();
        }
      });
      return;
    }

    const dialogRef = this.dialog.open(PartnerFormComponent, {
      width: '496px',
      maxWidth: '95vw',
      disableClose: true,
      data: {
        email: userEmail,
        role: 'trainer'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // optional: refresh list / show success / reload data
        this.snackbar.openSnackBar(
          'Trainer application submitted successfully.',
          'success'
        );
      }
    });
  }

  /** Replace an existing card in the list with updated data */
  private updateCardInList(trainer: Trainers): void {
    const idx = this.trainersResult.findIndex(t => t.id === trainer.id);
    if (idx !== -1) {
      const updated = [...this.trainersResult];
      updated[idx] = trainer;
      this.trainersResult = updated;
    }
  }

  likeTrainer(trainer: Trainers): void {
    const wasLiked = this.isLiked(trainer);

    this.trainerService.likeTrainer(trainer.id).subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.updateCardInList(res.data);
        }

        // Flip the heart instantly instead of waiting for a refetch to land.
        if (this.optimisticLikes.has(trainer.id)) {
          this.optimisticLikes.delete(trainer.id);
        } else {
          this.optimisticLikes.add(trainer.id);
        }

        this.snackbar.openSnackBar(
          wasLiked ? `Unliked ${trainer.name}` : `❤️ You liked ${trainer.name}`,
          ''
        );

        // Reconcile with the backend in the background.
        this.store.dispatch(loadTrainerLikes());
      },
      error: () => {
        this.snackbar.openSnackBar('Log in to like a trainer.', 'error');
      }
    });
  }

  isLiked(trainer: Trainers): boolean {
    const cached = this.trainerLikes.some(l => l.userId === this.user?.id && l.trainerId === trainer.id);
    return this.optimisticLikes.has(trainer.id) ? !cached : cached;
  }

  toggleShowMore(): void {
    this.showAll = !this.showAll;
  }

  formatUrl(name: string): string {
    return name?.replace(/ /g, '-').toLowerCase() ?? '';
  }

  onImageError(event: any): void {
    event.target.src = 'assets/avatar.png';
  }

  /** "Vancouver, Canada" for the first listed location, "—" when the trainer hasn't set any. */
  primaryLocationLabel(trainer: Trainers): string {
    const first = trainer?.locations?.[0];
    if (!first) return '—';
    return [first.city, first.country].filter(Boolean).join(', ');
  }

  extraLocationCount(trainer: Trainers): number {
    return Math.max(0, (trainer?.locations?.length ?? 0) - 1);
  }

  mapsUrl(trainer: Trainers): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.primaryLocationLabel(trainer))}`;
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}