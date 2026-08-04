// import { categoryFeatureKey } from './category.reducer';
// import * as CategorySelectors from './category.selectors';
// import { initialCategoryState } from './category.state';

// describe('Category Selectors', () => {

//   it('should select the feature state', () => {
//     const state = {
//       [categoryFeatureKey]: initialCategoryState
//     };

//     expect(CategorySelectors.selectCategoryState(state)).toEqual(initialCategoryState);
//   });

//   it('should select loading', () => {
//     const state = {
//       [categoryFeatureKey]: {
//         ...initialCategoryState,
//         loading: true
//       }
//     };

//     expect(CategorySelectors.selectCategoryLoading(state)).toBeTrue();
//   });

//   it('should select error', () => {
//     const state = {
//       [categoryFeatureKey]: {
//         ...initialCategoryState,
//         error: 'Something went wrong'
//       }
//     };

//     expect(CategorySelectors.selectCategoryError(state)).toBe('Something went wrong');
//   });

//   it('should select categories', () => {
//     const categories = [
//       { id: 1, name: 'Fitness' },
//       { id: 2, name: 'Yoga' }
//     ];

//     const state = {
//       [categoryFeatureKey]: {
//         ...initialCategoryState,
//         categories
//       }
//     };

//     expect(CategorySelectors.selectCategories(state)).toEqual(categories);
//   });

//   it('should select active categories', () => {
//     const activeCategories = [
//       { id: 1, name: 'Fitness' }
//     ];

//     const state = {
//       [categoryFeatureKey]: {
//         ...initialCategoryState,
//         activeCategories
//       }
//     };

//     expect(CategorySelectors.selectActiveCategories(state)).toEqual(activeCategories);
//   });

// });