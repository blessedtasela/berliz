import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CenterCategoriesComponent } from './center-categories.component';

describe('CenterCategoriesComponent', () => {
  let component: CenterCategoriesComponent;
  let fixture: ComponentFixture<CenterCategoriesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterCategoriesComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(CenterCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
