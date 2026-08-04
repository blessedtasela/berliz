import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CategoryState } from './category.state';
import { categoryFeatureKey } from './category.reducer';

const selectState = createFeatureSelector<CategoryState>(categoryFeatureKey);

// ── Async ─────────────────────────────────────────────────────────────────────
export const selectCategoryLoading = createSelector(selectState, s => s.loading);
export const selectCategoryError   = createSelector(selectState, s => s.error);

// ── Categories ────────────────────────────────────────────────────────────────
export const selectCategories        = createSelector(selectState, s => s.categories);
export const selectActiveCategories  = createSelector(selectState, s => s.activeCategories);
export const selectSelectedCategory  = createSelector(selectState, s => s.selectedCategory);
export const selectCategoriesByTag   = createSelector(selectState, s => s.byTag);

// ── Derived: active category count ────────────────────────────────────────────
export const selectActiveCategoryCount = createSelector(
  selectActiveCategories,
  list => list.length
);

// ── Likes ─────────────────────────────────────────────────────────────────────
export const selectCategoryLikes   = createSelector(selectState, s => s.categoryLikes);
export const selectMyCategoryLikes = createSelector(selectState, s => s.myCategoryLikes);

// ── Derived: ids of categories the current user has liked ─────────────────────
export const selectLikedCategoryIds = createSelector(
  selectMyCategoryLikes,
  likes => likes.map(l => l.categoryId)
);

// ── Tags ──────────────────────────────────────────────────────────────────────
export const selectTags = createSelector(selectState, s => s.tags);