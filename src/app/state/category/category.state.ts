import { Tags } from 'src/app/models/tags.interface';
import { Categories, CategoryLikes } from '../../models/categories.interface';

export interface CategoryState {
    loading: boolean;
    error: string | null;

    // Categories
    categories: Categories[];
    activeCategories: Categories[];
    selectedCategory: Categories | null;
    byTag: Categories[];

    // Likes
    categoryLikes: CategoryLikes[];
    myCategoryLikes: CategoryLikes[];

    // Tags
    tags: Tags[];
}

export const initialCategoryState: CategoryState = {
    loading: false,
    error: null,

    categories: [],
    activeCategories: [],
    selectedCategory: null,
    byTag: [],

    categoryLikes: [],
    myCategoryLikes: [],

    tags: [],
};