import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TrainerSubscription } from 'src/app/models/trainers.interface';
import { TrainerStateService } from 'src/app/services/trainer-state.service';

// Matches TrainerSubscription shape from backend:
// id, plan, mode, date, lastUpdate, trainer, client, categories

@Component({
  selector: 'app-trainer-subscriptions',
  templateUrl: './trainer-subscriptions.component.html',
  styleUrls: ['./trainer-subscriptions.component.css']
})
export class TrainerSubscriptionsComponent implements OnInit, OnDestroy {

  trainerSubscriptions: TrainerSubscription[] = [];
  showAll: boolean = false;
  searchTerm: string = '';
  sortOrder: 'newest' | 'oldest' | 'plan' | 'mode' = 'newest';
  pageSize: number = 10;

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
      this.trainerStateService.getMyTrainerSubscriptions().subscribe(subs => {
        this.trainerSubscriptions = subs ?? [];
      })
    );
  }

  filteredSubscriptions(): TrainerSubscription[] {
    let result = [...this.trainerSubscriptions];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(s => {
        const clientName = `${s.client?.user?.firstname ?? ''} ${s.client?.user?.lastname ?? ''}`.toLowerCase();
        return (
          clientName.includes(term) ||
          (s.plan ?? '').toLowerCase().includes(term) ||
          (s.mode ?? '').toLowerCase().includes(term)
        );
      });
    }

    result.sort((a, b) => {
      if (this.sortOrder === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (this.sortOrder === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (this.sortOrder === 'plan') {
        return (a.plan ?? '').localeCompare(b.plan ?? '');
      } else {
        return (a.mode ?? '').localeCompare(b.mode ?? '');
      }
    });

    return result;
  }

  visibleSubscriptions(): TrainerSubscription[] {
    const all = this.filteredSubscriptions();
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