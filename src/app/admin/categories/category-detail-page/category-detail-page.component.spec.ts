import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { CategoryDetailPageComponent } from './category-detail-page.component';
import { CategoryService } from 'src/app/services/category.service';
import { selectCategories } from 'src/app/state/category/category.selectors';

describe('CategoryDetailPageComponent', () => {
  let component: CategoryDetailPageComponent;
  let fixture: ComponentFixture<CategoryDetailPageComponent>;

  beforeEach(() => {
    const categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['getCategory']);
    categoryServiceSpy.getCategory.and.returnValue(of({ message: '', data: null, success: true, statusCode: 200 }));

    TestBed.configureTestingModule({
      declarations: [CategoryDetailPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore({ selectors: [{ selector: selectCategories, value: [] }] }),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } },
        { provide: CategoryService, useValue: categoryServiceSpy }
      ]
    });

    fixture = TestBed.createComponent(CategoryDetailPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
