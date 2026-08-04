import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { TrainerTestimonials } from 'src/app/models/trainers.interface';
import { selectMyTrainerTestimonials } from 'src/app/state/trainer/trainer.selector';
import { loadMyTrainerTestimonials } from 'src/app/state/trainer/trainer.actions';

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
      })
    );
  }

  filteredTestimonials(): TrainerTestimonials[] {
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

    return result;
  }

  visibleTestimonials(): TrainerTestimonials[] {
    const all = this.filteredTestimonials();
    return this.showAll ? all : all.slice(0, this.pageSize);
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
  }

  getProfilePhoto(photo: string): string {
    if (!photo) return 'assets/avatar.png';
    if (photo.startsWith('data:image') || photo.startsWith('http') || photo.startsWith('blob:')) {
      return photo;
    }
    return 'data:image/png;base64,' + photo;
  }

  formatDate(date: any): string {
    return this.datePipe.transform(new Date(date), 'dd/MM/yyyy') ?? '';
  }
}