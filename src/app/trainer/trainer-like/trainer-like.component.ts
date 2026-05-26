import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TrainerLikes } from 'src/app/models/trainers.interface';
import { TrainerStateService } from 'src/app/services/trainer-state.service';

// Matches TrainerMapper.trainerLikeResponseToDTO:
// id, date, userId, username, userEmail, trainerId, trainerName

@Component({
  selector: 'app-trainer-like',
  templateUrl: './trainer-like.component.html',
  styleUrls: ['./trainer-like.component.css']
})
export class TrainerLikeComponent implements OnInit, OnDestroy {

  trainerLikes: TrainerLikes[] = [];
  showAll: boolean = false;
  searchTerm: string = '';
  sortOrder: 'asc' | 'desc' | 'newest' | 'oldest' = 'newest';
  pageSize: number = 16;

  private subscriptions: Subscription[] = [];

  constructor(
    private trainerStateService: TrainerStateService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  handleEmitEvent(): void {
    this.subscriptions.push(
      this.trainerStateService.getMyTrainerLikes().subscribe(likes => {
        this.trainerLikes = likes ?? [];
      })
    );
  }

  filteredLikes(): TrainerLikes[] {
    let result = [...this.trainerLikes];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(l =>
        (l.username ?? '').toLowerCase().includes(term) ||
        (l.userEmail ?? '').toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      if (this.sortOrder === 'asc') {
        return (a.username ?? '').localeCompare(b.username ?? '');
      } else if (this.sortOrder === 'desc') {
        return (b.username ?? '').localeCompare(a.username ?? '');
      } else if (this.sortOrder === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });

    return result;
  }

  visibleLikes(): TrainerLikes[] {
    const all = this.filteredLikes();
    return this.showAll ? all : all.slice(0, this.pageSize);
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
  }

  // Likes don't expose a profile photo URL from the mapper;
  // fallback to avatar. Override if your backend adds photoUrl later.
  getProfilePhoto(userId: number): string {
    return 'assets/avatar.png';
  }

  formatDate(date: any): string {
    return this.datePipe.transform(new Date(date), 'dd/MM/yyyy') ?? '';
  }
}