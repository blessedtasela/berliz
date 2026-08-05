import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { CategoryService } from '../../services/category.service';
import * as A from './category.actions';

@Injectable()
export class CategoryEffects {

  constructor(
    private actions$: Actions,
    private svc: CategoryService,
  ) { }

  // =========================================================================
  // CATEGORY CRUD
  // =========================================================================

  loadCategories$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadCategories),
    mergeMap(() => this.svc.getCategories().pipe(
      map(r => A.loadCategoriesSuccess({ response: r })),
      catchError(e => of(A.loadCategoriesFailure({ error: e?.error?.message || 'Failed to load categories' })))
    ))
  ));

  loadActiveCategories$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadActiveCategories),
    mergeMap(() => this.svc.getActiveCategories().pipe(
      map(r => A.loadActiveCategoriesSuccess({ response: r })),
      catchError(e => of(A.loadActiveCategoriesFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadCategory$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadCategory),
    mergeMap(({ id }) => this.svc.getCategory(id).pipe(
      map(r => A.loadCategorySuccess({ response: r })),
      catchError(e => of(A.loadCategoryFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadCategoriesByTag$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadCategoriesByTag),
    mergeMap(({ tagId }) => this.svc.getCategoriesByTag(tagId).pipe(
      map(r => A.loadCategoriesByTagSuccess({ response: r })),
      catchError(e => of(A.loadCategoriesByTagFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  addCategory$ = createEffect(() => this.actions$.pipe(
    ofType(A.addCategory),
    mergeMap(({ data }) => this.svc.addCategory(data).pipe(
      map(r => A.addCategorySuccess({ response: r })),
      catchError(e => of(A.addCategoryFailure({ error: e?.error?.message || 'Failed to add category' })))
    ))
  ));

  updateCategory$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateCategory),
    mergeMap(({ data }) => this.svc.updateCategory(data).pipe(
      map(r => A.updateCategorySuccess({ response: r })),
      catchError(e => of(A.updateCategoryFailure({ error: e?.error?.message || 'Failed to update category' })))
    ))
  ));

  updateCategoryStatus$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateCategoryStatus),
    mergeMap(({ id }) => this.svc.updateStatus(id).pipe(
      map(r => A.updateCategoryStatusSuccess({ response: r })),
      catchError(e => of(A.updateCategoryStatusFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  deleteCategory$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteCategory),
    mergeMap(({ id }) => this.svc.deleteCategory(id).pipe(
      map(() => A.deleteCategorySuccess({ id })),
      catchError(e => of(A.deleteCategoryFailure({ error: e?.error?.message || 'Failed to delete category' })))
    ))
  ));

  // =========================================================================
  // LIKES
  // =========================================================================

  likeCategory$ = createEffect(() => this.actions$.pipe(
    ofType(A.likeCategory),
    mergeMap(({ id }) => this.svc.likeCategory(id).pipe(
      map(r => A.likeCategorySuccess({ response: r })),
      catchError(e => of(A.likeCategoryFailure({ error: e?.error?.message || 'Failed to like category' })))
    ))
  ));

  // A like/unlike changes which categories the current user has liked — refresh
  // that cache so the filled-heart state self-heals after the optimistic flip.
  reloadMyLikesAfterLike$ = createEffect(() => this.actions$.pipe(
    ofType(A.likeCategorySuccess),
    map(() => A.loadMyCategoryLikes())
  ));

  loadCategoryLikes$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadCategoryLikes),
    mergeMap(() => this.svc.getCategoryLikes().pipe(
      map(r => A.loadCategoryLikesSuccess({ response: r })),
      catchError(e => of(A.loadCategoryLikesFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadMyCategoryLikes$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyCategoryLikes),
    mergeMap(() => this.svc.getMyCategoryLikes().pipe(
      map(r => A.loadMyCategoryLikesSuccess({ response: r })),
      catchError(e => of(A.loadMyCategoryLikesFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  // =========================================================================
  // TAGS
  // =========================================================================

  loadTags$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadTags),
    mergeMap(() => this.svc.getAllTags().pipe(
      map(r => A.loadTagsSuccess({ response: r })),
      catchError(e => of(A.loadTagsFailure({ error: e?.error?.message || 'Failed to load tags' })))
    ))
  ));

  addTag$ = createEffect(() => this.actions$.pipe(
    ofType(A.addTag),
    mergeMap(({ data }) => this.svc.addTag(data).pipe(
      map(r => A.addTagSuccess({ response: r })),
      catchError(e => of(A.addTagFailure({ error: e?.error?.message || 'Failed to add tag' })))
    ))
  ));

  updateTag$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateTag),
    mergeMap(({ data }) => this.svc.updateTag(data).pipe(
      map(r => A.updateTagSuccess({ response: r })),
      catchError(e => of(A.updateTagFailure({ error: e?.error?.message || 'Failed to update tag' })))
    ))
  ));

  deleteTag$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteTag),
    mergeMap(({ id }) => this.svc.deleteTag(id).pipe(
      map(() => A.deleteTagSuccess({ id })),
      catchError(e => of(A.deleteTagFailure({ error: e?.error?.message || 'Failed to delete tag' })))
    ))
  ));
}