import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Categories, CategoryLikes, Icons } from '../models/categories.interface';
import { ApiResponse } from '../models/Api.interface';
import { Tags } from '../models/tags.interface';

/**
 * A Category is a Discipline everywhere a person sees it. The API is the same under /discipline (the product name)
 * and /category (kept on the server for older installed apps); this service uses /discipline.
 */
@Injectable({ providedIn: 'root' })
export class CategoryService {

  url = environment.api;

  // Icons are frontend-only display assets — no backend storage needed
  readonly icons: Icons[] = [
    { id: 1, name: 'bodyBuilding' },
    { id: 2, name: 'boxing' },
    { id: 3, name: 'classicPhysique' },
    { id: 4, name: 'kickboxing' },
    { id: 5, name: 'mma' },
    { id: 6, name: 'mensPhysique' },
    { id: 7, name: 'mealPlanning' },
    { id: 8, name: 'weightLifting' },
    { id: 9, name: 'wrestling' },
    { id: 10, name: 'yoga' },
    { id: 11, name: 'zumba' },
    { id: 12, name: 'workoutBells' },
  ];

  constructor(private http: HttpClient) { }

  getIcons(): Icons[] {
    return this.icons;
  }

  // ─────────────────────────────
  // CATEGORY CRUD
  // ─────────────────────────────

  addCategory(data: any) {
    return this.http.post<ApiResponse<Categories>>(`${this.url}/discipline/add`, data);
  }

  getCategories() {
    return this.http.get<ApiResponse<Categories[]>>(`${this.url}/discipline/get`);
  }

  getActiveCategories() {
    return this.http.get<ApiResponse<Categories[]>>(`${this.url}/discipline/getActiveCategories`);
  }

  getCategory(id: number) {
    return this.http.get<ApiResponse<Categories>>(`${this.url}/discipline/getCategory/${id}`);
  }

  getCategoriesByTag(tagId: number) {
    return this.http.get<ApiResponse<Categories[]>>(`${this.url}/discipline/getByTag/${tagId}`);
  }

  updateCategory(data: any) {
    return this.http.put<ApiResponse<Categories>>(`${this.url}/discipline/update`, data);
  }

  updateStatus(id: number) {
    return this.http.put<ApiResponse<Categories>>(`${this.url}/discipline/updateStatus/${id}`, null);
  }

  deleteCategory(id: number) {
    return this.http.delete<ApiResponse<void>>(`${this.url}/discipline/delete/${id}`);
  }

  // ─────────────────────────────
  // LIKES
  // ─────────────────────────────

  likeCategory(id: number) {
    return this.http.put<ApiResponse<Categories>>(`${this.url}/discipline/like/${id}`, null);
  }

  getCategoryLikes() {
    return this.http.get<ApiResponse<CategoryLikes[]>>(`${this.url}/discipline/getCategoryLikes`);
  }

  getMyCategoryLikes() {
    return this.http.get<ApiResponse<CategoryLikes[]>>(`${this.url}/discipline/getMyCategoryLikes`);
  }

  // ─────────────────────────────
  // TAGS
  // ─────────────────────────────

  addTag(data: any) {
    return this.http.post<ApiResponse<Tags>>(`${this.url}/discipline/tag/add`, data);
  }

  updateTag(data: any) {
    return this.http.put<ApiResponse<Tags>>(`${this.url}/discipline/tag/update`, data);
  }

  getAllTags() {
    return this.http.get<ApiResponse<Tags[]>>(`${this.url}/discipline/tag/getAll`);
  }

  deleteTag(id: number) {
    return this.http.delete<ApiResponse<void>>(`${this.url}/discipline/tag/delete/${id}`);
  }
}