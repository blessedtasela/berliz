import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Icons } from '../models/categories.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  url = environment.apiUrl;
  icons: Icons[];

  constructor(private httpClient: HttpClient) {
    this.icons = [
      { id: 1, name: "bodyBuilding" },
      { id: 2, name: "boxing" },
      { id: 3, name: "classicPhysique" },
      { id: 4, name: "kickboxing" },
      { id: 5, name: "mma" },
      { id: 6, name: "mensPhysique" },
      { id: 7, name: "mealPlanning" },
      { id: 8, name: "weightLifting" },
      { id: 9, name: "wrestling" },
      { id: 10, name: "yoga" },
      { id: 11, name: "zumba" },
      { id: 12, name: "workoutBells" },
    ];
  }

  getIcons() {
    return this.icons;
  }
  addCategory(data: any) {
    return this.httpClient.post(this.url + "/category/add", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getCategories() {
    return this.httpClient.get(this.url + "/category/get");
  }

  getActiveCategories() {
    return this.httpClient.get(this.url + "/category/getActiveCategories");
  }

  updateCategory(data: any) {
    return this.httpClient.put(this.url + "/category/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateStatus(id: any) {
    return this.httpClient.put(this.url + `/category/updateStatus/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  deleteCategory(id: any) {
    return this.httpClient.delete(this.url + `/category/delete/${id}`);
  }

  getCategory(id: any) {
    return this.httpClient.get(this.url + `/getcategory/${id}`);
  }


}
