import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Categories } from '../models/categories.interface';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService{
  private categoryData = new BehaviorSubject<Categories[]>([])
  data$ = this.categoryData.asObservable();

  constructor() { }

  setCategoryData(data: Categories[]) {
    this.categoryData.next(data);
  }

  getCategoryData(){
    return this.categoryData;
  }
}
