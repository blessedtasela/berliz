import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { Trainers, TrainerLikes } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';
import { TrainerService } from 'src/app/services/trainer.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { environment } from 'src/environments/environment';
import { genericError } from 'src/validators/form-validators.module';
import { TrainerPartnerFormComponent } from '../trainer-partner-form/trainer-partner-form.component';
import { MatDialog } from '@angular/material/dialog';
import { PartnerFormComponent } from 'src/app/shared/partner-form/partner-form.component';
import { Store } from '@ngrx/store';
import { selectUser } from 'src/app/state/user/user.selector';
import { selectCurrentTrainer, selectTrainerLikes } from 'src/app/state/trainer/trainer.selector';
import { loadTrainerLikes } from 'src/app/state/trainer/trainer.actions';


@Component({
  selector: 'app-trainers-search-result',
  templateUrl: './trainers-search-result.component.html',
  styleUrls: ['./trainers-search-result.component.css']
})
export class TrainersSearchResultComponent implements OnInit, OnDestroy {

  @Input() trainersResult: Trainers[] = [];

  readonly PAGE_SIZE = 12;
  readonly strapiUrl = environment.strapiUrl;

  showAll = false;
  get visibleCount() {
    return this.showAll
      ? this.trainersResult.length
      : Math.min(this.PAGE_SIZE, this.trainersResult.length);
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
    private dialog: MatDialog
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
      this.snackbar.openSnackBar(
        'Please log in to become a trainer.',
        'error'
      );
      return;
    }

    const dialogRef = this.dialog.open(PartnerFormComponent, {
      width: '600px',
      disableClose: true, // only explicit close button can close it
      data: {
        email: userEmail,
        role: 'trainer'
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      // only reload when something was actually saved
      if (result === 'saved') {
        this.trainersResult = [...this.trainersResult]; // Trigger change detection
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
    return name?.replace(/ /g, '-') ?? '';
  }

  onImageError(event: any): void {
    event.target.src = 'assets/avatar.png';
  }

  mapsUrl(address: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`;
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}