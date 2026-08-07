import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { Categories } from 'src/app/models/categories.interface';
import { CenterEquipment } from 'src/app/models/centers.interface';
import { Users } from 'src/app/models/users.interface';

import { loadAllCenterEquipment } from 'src/app/state/center/center.actions';
import { selectCenterEquipment } from 'src/app/state/center/center.selectors';
import { loadActiveCategories } from 'src/app/state/category/category.actions';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';
import { selectUser } from 'src/app/state/user/user.selector';

import { EquipmentDetailsModalComponent } from '../equipment-details-modal/equipment-details-modal.component';

/**
 * PUBLIC equipment browsing — reads the shared `selectCenterEquipment` slice
 * (every center's gear) and lets visitors search by name and narrow by
 * discipline. Cards link out to the owning center's public profile; the full
 * record (description + side/rear/front views) opens in a dialog rather than a
 * dedicated route.
 *
 * Rendered as the "Gear" SECTION of the Programs page (`/services`). Set
 * `[embedded]="true"` there so the standalone cinematic hero is dropped — the
 * page already has its own hero — and a compact section heading is used
 * instead. The component keeps working as a full page if it is ever routed
 * again.
 *
 * Anonymous visitors see at most `previewLimit` items; the rest sits behind a
 * login call-to-action instead of the show-more toggle.
 */
@Component({
  selector: 'app-equipment-page',
  templateUrl: './equipment-page.component.html',
  styleUrls: ['./equipment-page.component.css']
})
export class EquipmentPageComponent implements OnInit, OnDestroy {

  /** Hides the standalone hero when this sits inside another page. */
  @Input() embedded = false;

  equipment: CenterEquipment[] = [];
  categories: Categories[] = [];
  user: Users | null = null;

  searchTerm = '';
  selectedCategoryId: number | null = null;

  /** How many cards a single "page" of the grid shows. */
  readonly pageSize = 12;
  /** Hard ceiling for visitors who are not logged in. */
  readonly previewLimit = 20;

  showFullData = false;
  visibleItems = this.pageSize;

  private subscriptions: Subscription[] = [];

  constructor(
    private store: Store,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.store.dispatch(loadAllCenterEquipment());
    this.store.dispatch(loadActiveCategories());

    this.subscriptions.push(
      this.store.select(selectCenterEquipment).subscribe(list => this.equipment = list ?? []),
      this.store.select(selectActiveCategories).subscribe(list => this.categories = list ?? []),
      this.store.select(selectUser).subscribe(user => this.user = user ?? null)
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ── Filtering ───────────────────────────────────────────────────────────────

  get filteredEquipment(): CenterEquipment[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.equipment.filter(item => {
      const matchesTerm = !term
        || (item.name ?? '').toLowerCase().includes(term)
        || (item.centerName ?? '').toLowerCase().includes(term);

      const matchesCategory = this.selectedCategoryId === null
        || (item.categoryIds ?? []).includes(this.selectedCategoryId);

      return matchesTerm && matchesCategory;
    });
  }

  get hasActiveFilters(): boolean {
    return !!this.searchTerm.trim() || this.selectedCategoryId !== null;
  }

  selectCategory(id: number | null): void {
    this.selectedCategoryId = this.selectedCategoryId === id ? null : id;
    // A narrower result set should start collapsed again.
    this.collapse();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategoryId = null;
    this.collapse();
  }

  toggleData(): void {
    this.showFullData = !this.showFullData;
    this.visibleItems = this.showFullData ? this.browsableEquipment.length : this.pageSize;
  }

  private collapse(): void {
    this.showFullData = false;
    this.visibleItems = this.pageSize;
  }

  // ── Login gate ──────────────────────────────────────────────────────────────

  get isLoggedIn(): boolean {
    return !!this.user?.email;
  }

  /**
   * The matches a visitor is allowed to reach at all: everything when signed
   * in, only the first `previewLimit` otherwise.
   */
  get browsableEquipment(): CenterEquipment[] {
    const matches = this.filteredEquipment;
    return this.isLoggedIn ? matches : matches.slice(0, this.previewLimit);
  }

  /** The slice actually rendered right now (show-more expands within the cap). */
  get visibleEquipment(): CenterEquipment[] {
    return this.browsableEquipment.slice(0, this.visibleItems);
  }

  /** Show-more only makes sense while there is reachable gear left to reveal. */
  get canShowMore(): boolean {
    return this.browsableEquipment.length > this.pageSize;
  }

  /** Anonymous visitor with matches sitting behind the login wall. */
  get isLoginGated(): boolean {
    return !this.isLoggedIn && this.filteredEquipment.length > this.previewLimit;
  }

  get totalMatches(): number {
    return this.filteredEquipment.length;
  }

  // ── Display helpers ─────────────────────────────────────────────────────────

  categoryNamesFor(item: CenterEquipment): string[] {
    const ids = item?.categoryIds ?? [];
    return this.categories
      .filter(category => ids.includes(category.id))
      .map(category => category.name);
  }

  formatUrl(value: string): string {
    return (value ?? '').replace(/ /g, '-');
  }

  openDetails(item: CenterEquipment): void {
    this.dialog.open(EquipmentDetailsModalComponent, {
      width: '620px',
      maxWidth: '95vw',
      panelClass: 'berliz-modal',
      data: {
        equipment: item,
        categoryNames: this.categoryNamesFor(item)
      }
    });
  }

  trackByEquipmentId(_index: number, item: CenterEquipment): number {
    return item.id;
  }
}
