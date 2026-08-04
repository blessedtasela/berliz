import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Categories, CategoryLikes, Icons } from '../models/categories.interface';
import { ApiResponse } from '../models/Api.interface';
import { Tags } from '../models/tags.interface';

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
    return this.http.post<ApiResponse<Categories>>(`${this.url}/category/add`, data);
  }

  getCategories() {
    return this.http.get<ApiResponse<Categories[]>>(`${this.url}/category/get`);
  }

  getActiveCategories() {
    return this.http.get<ApiResponse<Categories[]>>(`${this.url}/category/getActiveCategories`);
  }

  getCategory(id: number) {
    return this.http.get<ApiResponse<Categories>>(`${this.url}/category/getCategory/${id}`);
  }

  getCategoriesByTag(tagId: number) {
    return this.http.get<ApiResponse<Categories[]>>(`${this.url}/category/getByTag/${tagId}`);
  }

  updateCategory(data: any) {
    return this.http.put<ApiResponse<Categories>>(`${this.url}/category/update`, data);
  }

  updateStatus(id: number) {
    return this.http.put<ApiResponse<Categories>>(`${this.url}/category/updateStatus/${id}`, null);
  }

  deleteCategory(id: number) {
    return this.http.delete<ApiResponse<void>>(`${this.url}/category/delete/${id}`);
  }

  // ─────────────────────────────
  // LIKES
  // ─────────────────────────────

  likeCategory(id: number) {
    return this.http.put<ApiResponse<Categories>>(`${this.url}/category/like/${id}`, null);
  }

  getCategoryLikes() {
    return this.http.get<ApiResponse<CategoryLikes[]>>(`${this.url}/category/getCategoryLikes`);
  }

  getMyCategoryLikes() {
    return this.http.get<ApiResponse<CategoryLikes[]>>(`${this.url}/category/getMyCategoryLikes`);
  }

  // ─────────────────────────────
  // TAGS
  // ─────────────────────────────

  addTag(data: any) {
    return this.http.post<ApiResponse<Tags>>(`${this.url}/category/tag/add`, data);
  }

  updateTag(data: any) {
    return this.http.put<ApiResponse<Tags>>(`${this.url}/category/tag/update`, data);
  }

  getAllTags() {
    return this.http.get<ApiResponse<Tags[]>>(`${this.url}/category/tag/getAll`);
  }

  deleteTag(id: number) {
    return this.http.delete<ApiResponse<void>>(`${this.url}/category/tag/delete/${id}`);
  }
}