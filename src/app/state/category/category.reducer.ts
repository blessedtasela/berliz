import { createReducer, on } from '@ngrx/store';
import * as A from './category.actions';
import { initialCategoryState } from './category.state';

export const categoryFeatureKey = 'category';

function upsert<T extends { id?: any }>(list: T[], item: T): T[] {
  if (!item) return list;
  const idx = list.findIndex(x => x.id === item.id);
  return idx >= 0
    ? [...list.slice(0, idx), item, ...list.slice(idx + 1)]
    : [...list, item];
}

export const categoryReducer = createReducer(
  initialCategoryState,

  // ── LOADING ───────────────────────────────────────────────────────────────
  on(
    A.loadCategories, A.loadActiveCategories, A.loadCategory, A.loadCategoriesByTag,
    A.addCategory, A.updateCategory, A.updateCategoryStatus, A.deleteCategory,
    A.likeCategory, A.loadCategoryLikes, A.loadMyCategoryLikes,
    A.loadTags, A.addTag, A.updateTag, A.deleteTag,
    state => ({ ...state, loading: true, error: null })
  ),

  // ── ALL FAILURES ──────────────────────────────────────────────────────────
  on(
    A.loadCategoriesFailure, A.loadActiveCategoriesFailure, A.loadCategoryFailure,
    A.loadCategoriesByTagFailure, A.addCategoryFailure, A.updateCategoryFailure,
    A.updateCategoryStatusFailure, A.deleteCategoryFailure, A.likeCategoryFailure,
    A.loadCategoryLikesFailure, A.loadMyCategoryLikesFailure,
    A.loadTagsFailure, A.addTagFailure, A.updateTagFailure, A.deleteTagFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  // =========================================================================
  // CATEGORY CRUD
  // =========================================================================
  on(A.loadCategoriesSuccess, (s, { response }) => ({
    ...s, loading: false, categories: response.data ?? []
  })),

  on(A.loadActiveCategoriesSuccess, (s, { response }) => ({
    ...s, loading: false, activeCategories: response.data ?? []
  })),

  on(A.loadCategorySuccess, (s, { response }) => ({
    ...s, loading: false, selectedCategory: response.data ?? null
  })),

  on(A.loadCategoriesByTagSuccess, (s, { response }) => ({
    ...s, loading: false, byTag: response.data ?? []
  })),

  on(A.addCategorySuccess, (s, { response }) => ({
    ...s, loading: false,
    categories: response.data ? [...s.categories, response.data] : s.categories,
    activeCategories: response.data ? [...s.activeCategories, response.data] : s.activeCategories,
  })),

  on(A.updateCategorySuccess, (s, { response }) => ({
    ...s, loading: false,
    selectedCategory: response.data ?? s.selectedCategory,
    categories: response.data ? upsert(s.categories, response.data) : s.categories,
    activeCategories: response.data ? upsert(s.activeCategories, response.data) : s.activeCategories,
  })),

  on(A.updateCategoryStatusSuccess, (s, { response }) => {
    const updated = response.data;
    if (!updated) return { ...s, loading: false };
    const isActive = updated.status === 'true';
    return {
      ...s, loading: false,
      selectedCategory: s.selectedCategory?.id === updated.id ? updated : s.selectedCategory,
      categories: upsert(s.categories, updated),
      // add to active list if activated, remove if deactivated
      activeCategories: isActive
        ? upsert(s.activeCategories, updated)
        : s.activeCategories.filter(c => c.id !== updated.id),
    };
  }),

  on(A.deleteCategorySuccess, (s, { id }) => ({
    ...s, loading: false,
    selectedCategory: s.selectedCategory?.id === id ? null : s.selectedCategory,
    categories: s.categories.filter(c => c.id !== id),
    activeCategories: s.activeCategories.filter(c => c.id !== id),
    byTag: s.byTag.filter(c => c.id !== id),
  })),

  // =========================================================================
  // LIKES
  // =========================================================================
  on(A.likeCategorySuccess, (s, { response }) => ({
    ...s, loading: false,
    selectedCategory: response.data ?? s.selectedCategory,
    categories: response.data ? upsert(s.categories, response.data) : s.categories,
    activeCategories: response.data ? upsert(s.activeCategories, response.data) : s.activeCategories,
  })),

  on(A.loadCategoryLikesSuccess, (s, { response }) => ({
    ...s, loading: false, categoryLikes: response.data ?? []
  })),

  on(A.loadMyCategoryLikesSuccess, (s, { response }) => ({
    ...s, loading: false, myCategoryLikes: response.data ?? []
  })),

  // =========================================================================
  // TAGS
  // =========================================================================
  on(A.loadTagsSuccess, (s, { response }) => ({
    ...s, loading: false, tags: response.data ?? []
  })),

  on(A.addTagSuccess, (s, { response }) => ({
    ...s, loading: false,
    tags: response.data ? [...s.tags, response.data] : s.tags,
  })),

  on(A.updateTagSuccess, (s, { response }) => ({
    ...s, loading: false,
    tags: response.data ? upsert(s.tags, response.data) : s.tags,
  })),

  on(A.deleteTagSuccess, (s, { id }) => ({
    ...s, loading: false,
    tags: s.tags.filter(t => t.id !== id),
  })),
);