import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { TrainerTestimonials } from 'src/app/models/trainers.interface';
import { selectMyTrainerTestimonials } from 'src/app/state/trainer/trainer.selector';
import { loadMyTrainerTestimonials } from 'src/app/state/trainer/trainer.actions';
import { memoizePhotoUriByKey } from 'src/app/shared/photo-lightbox/photo-data-uri';

@Component({
  selector: 'app-my-trainer-testimonials',
  templateUrl: './my-trainer-testimonials.component.html',
  styleUrls: ['./my-trainer-testimonials.component.css']
})
export class MyTrainerTestimonialsComponent {

  trainerTestimonials: TrainerTestimonials[] = [];
  showAll: boolean = false;
  searchTerm: string = '';
  sortOrder: 'newest' | 'oldest' | 'client' = 'newest';
  pageSize: number = 5;

  /**
   * `filtered`/`visible` used to be methods re-run on every change-detection
   * pass (the template called them straight from *ngIf/*ngFor), rebuilding a
   * fresh sorted array each tick -- which fed a trackBy-less *ngFor, so every
   * card (and its avatar image) was torn down and rebuilt every tick. Now
   * recomputed only when an actual input changes.
   */
  filtered: TrainerTestimonials[] = [];
  visible: TrainerTestimonials[] = [];

  private photoUri = memoizePhotoUriByKey();
  private subscriptions: Subscription[] = [];

  constructor(
    private store: Store,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  handleEmitEvent(): void {
    this.store.dispatch(loadMyTrainerTestimonials());
    this.subscriptions.push(
      this.store.select(selectMyTrainerTestimonials).subscribe(testimonials => {
        this.trainerTestimonials = (testimonials ?? []).map(t => ({
          ...t,
          expanded: false
        }));
        this.recompute();
      })
    );
  }

  onSearchChange(): void {
    this.recompute();
  }

  onSortChange(): void {
    this.recompute();
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
    this.recomputeVisible();
  }

  private recompute(): void {
    let result = [...this.trainerTestimonials];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(t => {
        const clientName = (t.clientName ?? '').toLowerCase();
        return (
          clientName.includes(term) ||
          (t.testimonial ?? '').toLowerCase().includes(term)
        );
      });
    }

    result.sort((a, b) => {
      if (this.sortOrder === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (this.sortOrder === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        const nameA = a.clientName ?? '';
        const nameB = b.clientName ?? '';
        return nameA.localeCompare(nameB);
      }
    });

    this.filtered = result;
    this.recomputeVisible();
  }

  private recomputeVisible(): void {
    this.visible = this.showAll ? this.filtered : this.filtered.slice(0, this.pageSize);
  }

  trackById = (_: number, t: TrainerTestimonials) => t.id;

  getProfilePhoto(testimonial: TrainerTestimonials): string {
    return this.photoUri(testimonial.id, testimonial.clientPhotoUrl) ?? 'assets/avatar.png';
  }

  formatDate(date: any): string {
    return this.datePipe.transform(new Date(date), 'dd/MM/yyyy') ?? '';
  }
}