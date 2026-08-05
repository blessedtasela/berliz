import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { CenterLikes } from 'src/app/models/centers.interface';
import { loadCenterLikes } from 'src/app/state/center/center.actions';
import { selectCenterLikes } from 'src/app/state/center/center.selectors';

@Component({
  selector: 'app-center-like',
  templateUrl: './center-like.component.html',
  styleUrls: ['./center-like.component.css']
})
export class CenterLikeComponent implements OnInit, OnDestroy {

  centerLikes: CenterLikes[] = [];

  showAll = false;
  searchTerm = '';
  sortOrder: 'asc' | 'desc' | 'newest' | 'oldest' = 'newest';
  pageSize = 12;

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
    this.store.dispatch(loadCenterLikes());
    this.subscriptions.push(
      this.store.select(selectCenterLikes).subscribe(likes => {
        this.centerLikes = likes ?? [];
      })
    );
  }

  filteredLikes(): CenterLikes[] {
    let result = [...this.centerLikes];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(l => (l.userEmail ?? '').toLowerCase().includes(term));
    }

    result.sort((a, b) => {
      if (this.sortOrder === 'asc') {
        return (a.userEmail ?? '').localeCompare(b.userEmail ?? '');
      } else if (this.sortOrder === 'desc') {
        return (b.userEmail ?? '').localeCompare(a.userEmail ?? '');
      } else if (this.sortOrder === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return result;
  }

  visibleLikes(): CenterLikes[] {
    const all = this.filteredLikes();
    return this.showAll ? all : all.slice(0, this.pageSize);
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
  }

  formatDate(date: any): string {
    return this.datePipe.transform(new Date(date), 'dd/MM/yyyy') ?? '';
  }
}
