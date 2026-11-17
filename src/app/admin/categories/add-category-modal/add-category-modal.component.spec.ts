import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { of, throwError } from 'rxjs';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { CategoryService } from 'src/app/services/category.service';
import { StrapiService } from 'src/app/services/strapi.service';

import { AddCategoryModalComponent } from './add-category-modal.component';

describe('AddCategoryModalComponent', () => {
  let component: AddCategoryModalComponent;
  let fixture: ComponentFixture<AddCategoryModalComponent>;
  let categoryServiceSpy: jasmine.SpyObj<CategoryService>;
  let snackbarSpy: jasmine.SpyObj<SnackBarService>;

  beforeEach(() => {
    categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['addCategory']);
    snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [AddCategoryModalComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: NgxUiLoaderService, useValue: jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']) },
        { provide: SnackBarService, useValue: snackbarSpy },
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: StrapiService, useValue: jasmine.createSpyObj('StrapiService', ['uploadToStrapi']) }
      ]
    });
    fixture = TestBed.createComponent(AddCategoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // GN-54: a dead 'photo' form control (Validators.required, never written to by the
  // cropper flow) made addCategoryForm.invalid permanently true the moment a real photo
  // was picked, so every genuinely valid submission failed with a generic "Invalid form".
  describe('addCategory (GN-54)', () => {
    function fillValidFields(): void {
      component.addCategoryForm.patchValue({ name: 'Calisthenics', description: 'A full bodyweight training discipline for strength and mobility.' });
      const tagIds = component.addCategoryForm.get('tagIds') as any;
      tagIds.push(component['formBuilder'].group({ tagIds: '1' }));
    }

    it('submits successfully once name, description, tags and a photo are all provided', () => {
      fillValidFields();
      component.photoRequest = { id: 0, strapiId: 1, photoUrl: 'x', name: 'x', mimeType: 'image/jpeg', byteSize: 1, ownerId: 0 } as any;
      categoryServiceSpy.addCategory.and.returnValue(of({ message: 'Discipline added: Calisthenics' }) as any);

      component.addCategory();

      expect(categoryServiceSpy.addCategory).toHaveBeenCalled();
      expect(snackbarSpy.openSnackBar).toHaveBeenCalledWith('Discipline added: Calisthenics', '');
    });

    it('still blocks submission with a specific message when no photo was picked', () => {
      fillValidFields();
      component.photoRequest = null;

      component.addCategory();

      expect(categoryServiceSpy.addCategory).not.toHaveBeenCalled();
      expect(snackbarSpy.openSnackBar).toHaveBeenCalledWith('Please select a photo', 'error');
    });

    it('surfaces the real backend error message on failure, not a swallowed generic one', () => {
      fillValidFields();
      component.photoRequest = { id: 0, strapiId: 1, photoUrl: 'x', name: 'x', mimeType: 'image/jpeg', byteSize: 1, ownerId: 0 } as any;
      categoryServiceSpy.addCategory.and.returnValue(throwError(() => ({ error: { message: 'A category named Calisthenics already exists' } })));

      component.addCategory();

      expect(snackbarSpy.openSnackBar).toHaveBeenCalledWith('A category named Calisthenics already exists', 'error');
    });
  });
});
