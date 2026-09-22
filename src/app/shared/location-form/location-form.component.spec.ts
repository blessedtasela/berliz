import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { LocationFormComponent } from './location-form.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('LocationFormComponent', () => {
  let component: LocationFormComponent;
  let fixture: ComponentFixture<LocationFormComponent>;

  beforeEach(() => {
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [LocationFormComponent],
      imports: [HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: SnackBarService, useValue: snackbarSpy }
      ]
    });
    fixture = TestBed.createComponent(LocationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('flags a touched, invalid country/state/city/countryCode select with the shared error style', () => {
    // country's own valueChanges resets + disables state, and state's own
    // valueChanges resets + disables city (see ngOnInit) -- each has to be
    // re-enabled and set in that order, or a later step's null value just
    // disables (and so un-flags) the one before it again.
    component.form.get('country')?.markAsTouched();
    component.form.get('country')?.setValue(null);

    component.form.get('state')?.enable({ emitEvent: false });
    component.form.get('state')?.markAsTouched();
    component.form.get('state')?.setValue(null);

    component.form.get('city')?.enable({ emitEvent: false });
    component.form.get('city')?.markAsTouched();
    component.form.get('city')?.setValue(null);

    component.form.get('countryCode')?.markAsTouched();
    component.form.get('countryCode')?.setValue(null);
    fixture.detectChanges();

    for (const name of ['country', 'state', 'city', 'countryCode']) {
      const el = fixture.nativeElement.querySelector(`ng-select[formcontrolname="${name}"]`);
      expect(el?.classList.contains('berliz-select--error')).withContext(name).toBeTrue();
    }
  });

  it('does not flag a touched, valid select', () => {
    component.form.get('country')?.setValue('CA');
    component.form.get('country')?.markAsTouched();
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('ng-select[formcontrolname="country"]');
    expect(el?.classList.contains('berliz-select--error')).toBeFalse();
  });
});
