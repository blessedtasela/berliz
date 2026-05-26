import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TrainerTestimonials } from 'src/app/models/trainers.interface';
import { TrainerStateService } from 'src/app/services/trainer-state.service';

// TrainerTestimonials shape:
// id, testimonial, date, lastUpdate, trainer, client

@Component({
  selector: 'app-trainer-testimonials',
  templateUrl: './trainer-testimonials.component.html',
  styleUrls: ['./trainer-testimonials.component.css']
})
export class TrainerTestimonialsComponent implements OnInit, OnDestroy {

  trainerTestimonials: TrainerTestimonials[] = [];
  showAll: boolean = false;
  searchTerm: string = '';
  sortOrder: 'newest' | 'oldest' | 'client' = 'newest';
  pageSize: number = 5;

  private subscriptions: Subscription[] = [];

  constructor(
    private trainerStateService: TrainerStateService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  handleEmitEvent(): void {
    this.subscriptions.push(
      this.trainerStateService.getMyTrainerTestimonials().subscribe(testimonials => {
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
        const clientName = `${t.client?.user?.firstname ?? ''} ${t.client?.user?.lastname ?? ''}`.toLowerCase();
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
        const nameA = `${a.client?.user?.firstname ?? ''} ${a.client?.user?.lastname ?? ''}`;
        const nameB = `${b.client?.user?.firstname ?? ''} ${b.client?.user?.lastname ?? ''}`;
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