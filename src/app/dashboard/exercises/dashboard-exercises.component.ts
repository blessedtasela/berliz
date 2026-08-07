import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { Categories } from 'src/app/models/categories.interface';
import { CenterEquipment } from 'src/app/models/centers.interface';
import { Exercises } from 'src/app/models/exercise.interface';
import { MuscleGroups } from 'src/app/models/muscle-groups.interface';
import { Users } from 'src/app/models/users.interface';

import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';

import { loadActiveCategories } from 'src/app/state/category/category.actions';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';
import {
  deleteCenterEquipment,
  loadAllCenterEquipment,
  loadMyCenterEquipment
} from 'src/app/state/center/center.actions';
import { selectCenterEquipment, selectMyCenterEquipment } from 'src/app/state/center/center.selectors';
import { loadActiveExercises } from 'src/app/state/exercise/exercise.actions';
import { selectActiveExercises } from 'src/app/state/exercise/exercise.selectors';
import { loadActiveMuscleGroups } from 'src/app/state/muscle-group/muscle-group.actions';
import { selectActiveMuscleGroups } from 'src/app/state/muscle-group/muscle-group.selectors';
import { selectUser } from 'src/app/state/user/user.selector';

import { EquipmentFormModalComponent } from './equipment-form-modal/equipment-form-modal.component';

/**
 * READ-ONLY exercise library for any signed-in user — `/dashboard/exercises`.
 *
 * Admin CRUD for exercises lives in `src/app/admin/exercises`; this page only
 * browses/searches the same `selectActiveExercises` store slice.
 *
 * The page is tabbed: "Exercises" (the library) and "Equipment" (every center's
 * gear, plus a "My equipment" management section when the signed-in user owns a
 * center).
 */
@Component({
  selector: 'app-dashboard-exercises',
  templateUrl: './dashboard-exercises.component.html',
  styleUrls: ['./dashboard-exercises.component.css']
})
export class DashboardExercisesComponent implements OnInit, OnDestroy {

  activeTab: 'exercises' | 'equipment' = 'exercises';

  exercises: Exercises[] = [];
  categories: Categories[] = [];
  muscleGroups: MuscleGroups[] = [];

  equipment: CenterEquipment[] = [];
  myEquipment: CenterEquipment[] = [];

  user: Users | null = null;

  searchTerm = '';
  selectedCategoryId: number | null = null;
  selectedMuscleGroupId: number | null = null;

  /** Equipment tab keeps its own search/discipline state so the tabs don't fight. */
  equipmentSearchTerm = '';
  selectedEquipmentCategoryId: number | null = null;

  /** id of the card whose demo clip is expanded */
  openDemoId: number | null = null;

  private subs: Subscription[] = [];

  constructor(
    private store: Store,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.store.dispatch(loadActiveExercises());
    this.store.dispatch(loadActiveCategories());
    this.store.dispatch(loadActiveMuscleGroups());
    this.store.dispatch(loadAllCenterEquipment());

    this.subs.push(
      this.store.select(selectActiveExercises).subscribe(list => this.exercises = list ?? []),
      this.store.select(selectActiveCategories).subscribe(list => this.categories = list ?? []),
      this.store.select(selectActiveMuscleGroups).subscribe(list => this.muscleGroups = list ?? []),
      this.store.select(selectCenterEquipment).subscribe(list => this.equipment = list ?? []),
      this.store.select(selectMyCenterEquipment).subscribe(list => this.myEquipment = list ?? []),

      this.store.select(selectUser).subscribe(user => {
        const wasCenter = this.isCenter;
        this.user = user;
        // Only a center-role user has equipment of their own to manage.
        if (this.isCenter && !wasCenter) {
          this.store.dispatch(loadMyCenterEquipment());
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // ── Tabs ────────────────────────────────────────────────────────────────────

  setTab(tab: 'exercises' | 'equipment'): void {
    this.activeTab = tab;
  }

  get isCenter(): boolean {
    return (this.user?.role ?? '').toLowerCase() === 'center';
  }

  // ── Filtering: exercises ────────────────────────────────────────────────────

  get filteredExercises(): Exercises[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.exercises.filter(e => {
      const matchesTerm = !term
        || (e.name ?? '').toLowerCase().includes(term)
        || (e.description ?? '').toLowerCase().includes(term)
        || (e.muscleGroups ?? []).some(m => (m.name ?? '').toLowerCase().includes(term));

      const matchesCategory = this.selectedCategoryId === null
        || (e.categories ?? []).some(c => c.id === this.selectedCategoryId);

      const matchesMuscleGroup = this.selectedMuscleGroupId === null
        || (e.muscleGroups ?? []).some(m => m.id === this.selectedMuscleGroupId);

      return matchesTerm && matchesCategory && matchesMuscleGroup;
    });
  }

  get hasActiveFilters(): boolean {
    return !!this.searchTerm.trim()
      || this.selectedCategoryId !== null
      || this.selectedMuscleGroupId !== null;
  }

  selectCategory(id: number | null): void {
    this.selectedCategoryId = this.selectedCategoryId === id ? null : id;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategoryId = null;
    this.selectedMuscleGroupId = null;
  }

  // ── Filtering: equipment ────────────────────────────────────────────────────

  get filteredEquipment(): CenterEquipment[] {
    return this.filterEquipment(this.equipment);
  }

  get filteredMyEquipment(): CenterEquipment[] {
    return this.filterEquipment(this.myEquipment);
  }

  private filterEquipment(list: CenterEquipment[]): CenterEquipment[] {
    const term = this.equipmentSearchTerm.trim().toLowerCase();

    return list.filter(item => {
      const matchesTerm = !term
        || (item.name ?? '').toLowerCase().includes(term)
        || (item.description ?? '').toLowerCase().includes(term)
        || (item.centerName ?? '').toLowerCase().includes(term);

      const matchesCategory = this.selectedEquipmentCategoryId === null
        || (item.categoryIds ?? []).includes(this.selectedEquipmentCategoryId);

      return matchesTerm && matchesCategory;
    });
  }

  get hasActiveEquipmentFilters(): boolean {
    return !!this.equipmentSearchTerm.trim() || this.selectedEquipmentCategoryId !== null;
  }

  selectEquipmentCategory(id: number | null): void {
    this.selectedEquipmentCategoryId = this.selectedEquipmentCategoryId === id ? null : id;
  }

  clearEquipmentFilters(): void {
    this.equipmentSearchTerm = '';
    this.selectedEquipmentCategoryId = null;
  }

  // ── My equipment CRUD (center role only) ────────────────────────────────────

  openAddEquipment(): void {
    this.dialog.open(EquipmentFormModalComponent, {
      width: '640px',
      maxWidth: '95vw',
      panelClass: 'berliz-modal',
      data: { mode: 'add', categories: this.categories }
    });
  }

  openEditEquipment(item: CenterEquipment): void {
    this.dialog.open(EquipmentFormModalComponent, {
      width: '640px',
      maxWidth: '95vw',
      panelClass: 'berliz-modal',
      data: { mode: 'edit', equipment: item, categories: this.categories }
    });
  }

  confirmDeleteEquipment(item: CenterEquipment): void {
    const ref = this.dialog.open(PromptModalComponent, {
      width: '400px',
      maxWidth: '95vw',
      data: {
        confirmation: true,
        title: 'Delete equipment',
        message: `Remove "${item.name}" from your center? This cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        icon: 'trash-2'
      }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.dispatch(deleteCenterEquipment({ id: item.id }));
      }
    });
  }

  // ── Display helpers ─────────────────────────────────────────────────────────

  toggleDemo(exercise: Exercises): void {
    this.openDemoId = this.openDemoId === exercise.id ? null : exercise.id;
  }

  muscleGroupsFor(exercise: Exercises): string {
    return (exercise?.muscleGroups ?? []).map(m => m.name).join(' · ');
  }

  categoryNamesFor(item: CenterEquipment): string[] {
    const ids = item?.categoryIds ?? [];
    return this.categories
      .filter(category => ids.includes(category.id))
      .map(category => category.name);
  }

  formatUrl(value: string): string {
    return (value ?? '').replace(/ /g, '-');
  }

  trackByExerciseId(_index: number, exercise: Exercises): number {
    return exercise.id;
  }

  trackByEquipmentId(_index: number, item: CenterEquipment): number {
    return item.id;
  }
}
