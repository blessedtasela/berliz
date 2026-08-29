import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { Subject, of } from 'rxjs';

import { TestimonialFormComponent } from './testimonial-form.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('TestimonialFormComponent', () => {
  let component: TestimonialFormComponent;
  let fixture: ComponentFixture<TestimonialFormComponent>;

  beforeEach(() => {
    const storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'select']);
    storeSpy.select.and.returnValue(of(null));
    const snackBarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [TestimonialFormComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Actions, useValue: new Subject() },
        { provide: SnackBarService, useValue: snackBarSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    });
    fixture = TestBed.createComponent(TestimonialFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Regression: the target picker used to stay expanded (showing the full
  // list) after a selection was made, with no way to collapse it back down.
  describe('target picker open/closed state', () => {
    it('starts open', () => {
      expect(component.pickerOpen).toBeTrue();
    });

    it('choosing an option closes the picker and shows it as selected', () => {
      component.chooseTarget({ id: 5, name: 'Downtown Gym', subtitle: '' });

      expect(component.pickerOpen).toBeFalse();
      expect(component.targetId).toBe(5);
    });

    it('openPicker re-expands it (e.g. to change the selection)', () => {
      component.chooseTarget({ id: 5, name: 'Downtown Gym', subtitle: '' });
      component.openPicker();

      expect(component.pickerOpen).toBeTrue();
    });

    it('switching target type re-opens the picker for the new list', () => {
      component.chooseTarget({ id: 5, name: 'Downtown Gym', subtitle: '' });

      component.setTarget('trainer');

      expect(component.pickerOpen).toBeTrue();
      expect(component.targetId).toBeNull();
    });
  });
});
