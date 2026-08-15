import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { UpdateCategoryModalComponent } from './update-category-modal.component';
import { CategoryService } from 'src/app/services/category.service';
import { TagService } from 'src/app/services/tag.service';
import { StrapiService } from 'src/app/services/strapi.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('UpdateCategoryModalComponent', () => {
  let component: UpdateCategoryModalComponent;
  let fixture: ComponentFixture<UpdateCategoryModalComponent>;

  beforeEach(() => {
    const categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['updateCategory']);
    const tagServiceSpy = jasmine.createSpyObj('TagService', ['getActiveTags']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const strapiServiceSpy = jasmine.createSpyObj('StrapiService', ['uploadToStrapi']);
    const snackbarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [UpdateCategoryModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        provideMockStore(),
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: TagService, useValue: tagServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: StrapiService, useValue: strapiServiceSpy },
        { provide: SnackBarService, useValue: snackbarServiceSpy },
        { provide: MAT_DIALOG_DATA, useValue: { categoryData: { tagIds: [] } } }
      ]
    });
    fixture = TestBed.createComponent(UpdateCategoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
