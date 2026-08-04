import { createAction, props } from '@ngrx/store';
import { ApiResponse } from '../../models/Api.interface';
import { Categories, CategoryLikes } from '../../models/categories.interface';
import { Tags } from 'src/app/models/tags.interface';

type Res<T> = { response: ApiResponse<T> };
type Err  = { error: string };
type Id   = { id: number };
type Data = { data: any };

// =============================================================================
// CATEGORY CRUD
// =============================================================================
export const loadCategories = createAction('[Category] Load All');
export const loadCategoriesSuccess = createAction('[Category] Load All Success', props<Res<Categories[]>>());
export const loadCategoriesFailure = createAction('[Category] Load All Failure', props<Err>());

export const loadActiveCategories = createAction('[Category] Load Active');
export const loadActiveCategoriesSuccess = createAction('[Category] Load Active Success', props<Res<Categories[]>>());
export const loadActiveCategoriesFailure = createAction('[Category] Load Active Failure', props<Err>());

export const loadCategory = createAction('[Category] Load By Id', props<Id>());
export const loadCategorySuccess = createAction('[Category] Load By Id Success', props<Res<Categories>>());
export const loadCategoryFailure = createAction('[Category] Load By Id Failure', props<Err>());

export const loadCategoriesByTag = createAction('[Category] Load By Tag', props<{ tagId: number }>());
export const loadCategoriesByTagSuccess = createAction('[Category] Load By Tag Success', props<Res<Categories[]>>());
export const loadCategoriesByTagFailure = createAction('[Category] Load By Tag Failure', props<Err>());

export const addCategory = createAction('[Category] Add', props<Data>());
export const addCategorySuccess = createAction('[Category] Add Success', props<Res<Categories>>());
export const addCategoryFailure = createAction('[Category] Add Failure', props<Err>());

export const updateCategory = createAction('[Category] Update', props<Data>());
export const updateCategorySuccess = createAction('[Category] Update Success', props<Res<Categories>>());
export const updateCategoryFailure = createAction('[Category] Update Failure', props<Err>());

export const updateCategoryStatus = createAction('[Category] Update Status', props<Id>());
export const updateCategoryStatusSuccess = createAction('[Category] Update Status Success', props<Res<Categories>>());
export const updateCategoryStatusFailure = createAction('[Category] Update Status Failure', props<Err>());

export const deleteCategory = createAction('[Category] Delete', props<Id>());
export const deleteCategorySuccess = createAction('[Category] Delete Success', props<Id>());
export const deleteCategoryFailure = createAction('[Category] Delete Failure', props<Err>());

// =============================================================================
// LIKES
// =============================================================================
export const likeCategory = createAction('[Category] Like', props<Id>());
export const likeCategorySuccess = createAction('[Category] Like Success', props<Res<Categories>>());
export const likeCategoryFailure = createAction('[Category] Like Failure', props<Err>());

export const loadCategoryLikes = createAction('[Category] Load Likes');
export const loadCategoryLikesSuccess = createAction('[Category] Load Likes Success', props<Res<CategoryLikes[]>>());
export const loadCategoryLikesFailure = createAction('[Category] Load Likes Failure', props<Err>());

export const loadMyCategoryLikes = createAction('[Category] Load My Likes');
export const loadMyCategoryLikesSuccess = createAction('[Category] Load My Likes Success', props<Res<CategoryLikes[]>>());
export const loadMyCategoryLikesFailure = createAction('[Category] Load My Likes Failure', props<Err>());

// =============================================================================
// TAGS
// =============================================================================
export const loadTags = createAction('[Category] Load Tags');
export const loadTagsSuccess = createAction('[Category] Load Tags Success', props<Res<Tags[]>>());
export const loadTagsFailure = createAction('[Category] Load Tags Failure', props<Err>());

export const addTag = createAction('[Category] Add Tag', props<Data>());
export const addTagSuccess = createAction('[Category] Add Tag Success', props<Res<Tags>>());
export const addTagFailure = createAction('[Category] Add Tag Failure', props<Err>());

export const updateTag = createAction('[Category] Update Tag', props<Data>());
export const updateTagSuccess = createAction('[Category] Update Tag Success', props<Res<Tags>>());
export const updateTagFailure = createAction('[Category] Update Tag Failure', props<Err>());

export const deleteTag = createAction('[Category] Delete Tag', props<Id>());
export const deleteTagSuccess = createAction('[Category] Delete Tag Success', props<Id>());
export const deleteTagFailure = createAction('[Category] Delete Tag Failure', props<Err>());