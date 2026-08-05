import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Categories } from 'src/app/models/categories.interface';
import { CenterLikes, Centers } from 'src/app/models/centers.interface';
import { Users } from 'src/app/models/users.interface';
import { CenterService } from 'src/app/services/center.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { selectCenterLikes } from 'src/app/state/center/center.selectors';
import { loadCenterLikes } from 'src/app/state/center/center.actions';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';
import { loadActiveCategories } from 'src/app/state/category/category.actions';
import { selectUser } from 'src/app/state/user/user.selector';

@Component({
  selector: 'app-center-search-result',
  templateUrl: './center-search-result.component.html',
  styleUrls: ['./center-search-result.component.css']
})
export class CenterSearchResultComponent implements OnInit, OnDestroy {

  @Input() centersResult: Centers[] = [];
  @Input() totalCenters: number = 0;

  readonly PAGE_SIZE = 12;

  showAll = false;
  get visibleCount() {
    return this.showAll
      ? this.centersResult.length
      : Math.min(this.PAGE_SIZE, this.centersResult.length);
  }

  user!: Users | null;
  centerLikes: CenterLikes[] = [];
  private allCategories: Categories[] = [];

  /** centerIds flipped locally, pending backend reconciliation — makes the heart fill instantly */
  private optimisticLikes = new Set<number>();

  private subs: Subscription[] = [];

  constructor(
    private datePipe: DatePipe,
    private store: Store,
    private centerService: CenterService,
    private rxStompService: RxStompService,
    private snackbar: SnackBarService
  ) { }

  ngOnInit(): void {
    this.watchLikeCenter();
    this.watchUpdatePhoto();
    this.watchUpdateCenterStatus();
    this.watchUpdateCenter();

    this.subs.push(this.store.select(selectUser).subscribe(u => this.user = u));

    this.store.dispatch(loadCenterLikes());
    this.subs.push(
      this.store.select(selectCenterLikes).subscribe(cached => {
        this.centerLikes = cached;
        // Fresh truth arrived from the backend — drop any optimistic overrides.
        this.optimisticLikes.clear();
      })
    );

    this.store.dispatch(loadActiveCategories());
    this.subs.push(
      this.store.select(selectActiveCategories).subscribe(categories => {
        this.allCategories = categories ?? [];
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  categoriesFor(center: Centers): Categories[] {
    const ids = center.categoryIds ?? [];
    return this.allCategories.filter(c => ids.includes(c.id));
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

  mapsUrl(center: Centers): string {
    if (center.location) return center.location;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.address || '')}`;
  }

  /** Replace an existing card in the list with updated data */
  private updateCardInList(center: Centers): void {
    const idx = this.centersResult.findIndex(c => c.id === center.id);
    if (idx !== -1) {
      const updated = [...this.centersResult];
      updated[idx] = center;
      this.centersResult = updated;
    }
  }

  likeCenter(center: Centers): void {
    const wasLiked = this.isLikedCenter(center);

    this.centerService.likeCenter(center.id).subscribe({
      next: (response: any) => {
        if (response?.data) {
          this.updateCardInList(response.data);
        }

        // Flip the heart instantly instead of waiting for a refetch to land.
        if (this.optimisticLikes.has(center.id)) {
          this.optimisticLikes.delete(center.id);
        } else {
          this.optimisticLikes.add(center.id);
        }

        this.snackbar.openSnackBar(
          wasLiked ? `Unliked ${center.name}` : `❤️ You liked ${center.name}`,
          ''
        );

        // Reconcile with the backend in the background.
        this.store.dispatch(loadCenterLikes());
      },
      error: () => {
        this.snackbar.openSnackBar('Log in to like a center.', 'error');
      }
    });
  }

  isLikedCenter(center: Centers): boolean {
    const cached = this.centerLikes.some(l => l.userId === this.user?.id && l.centerId === center.id);
    return this.optimisticLikes.has(center.id) ? !cached : cached;
  }

  watchLikeCenter(): void {
    this.rxStompService.watch('/topic/likeCenter').subscribe((message) => {
      const receivedCenter: Centers = JSON.parse(message.body);
      this.updateCardInList(receivedCenter);
    });
  }

  watchUpdateCenter(): void {
    this.rxStompService.watch('/topic/updateCenter').subscribe((message) => {
      const receivedCenter: Centers = JSON.parse(message.body);
      this.updateCardInList(receivedCenter);
    });
  }

  watchUpdateCenterStatus(): void {
    this.rxStompService.watch('/topic/updateCenterStatus').subscribe((message) => {
      const receivedCenter: Centers = JSON.parse(message.body);
      if (receivedCenter.status === 'true') {
        this.centersResult = [...this.centersResult, receivedCenter];
      } else {
        this.centersResult = this.centersResult.filter(center => center.id !== receivedCenter.id);
      }
    });
  }

  watchUpdatePhoto(): void {
    this.rxStompService.watch('/topic/updateCenterPhoto').subscribe((message) => {
      const receivedCenter: Centers = JSON.parse(message.body);
      this.updateCardInList(receivedCenter);
    });
  }

}
