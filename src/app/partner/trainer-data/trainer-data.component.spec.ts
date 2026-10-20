import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { of, throwError } from 'rxjs';

import { TrainerDataComponent } from './trainer-data.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { AuthService } from 'src/app/services/auth.service';
import { LocationService } from 'src/app/services/location.service';

describe('TrainerDataComponent', () => {
  let component: TrainerDataComponent;
  let fixture: ComponentFixture<TrainerDataComponent>;
  let ngxService: jasmine.SpyObj<NgxUiLoaderService>;
  let snackbar: jasmine.SpyObj<SnackBarService>;
  let trainerService: jasmine.SpyObj<TrainerService>;

  beforeEach(() => {
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const trainerServiceSpy = jasmine.createSpyObj('TrainerService', ['updateTrainer']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const locationServiceSpy = jasmine.createSpyObj('LocationService', ['getStates', 'getCities'], { countries$: of([]) });
    locationServiceSpy.getStates.and.returnValue(of([]));
    locationServiceSpy.getCities.and.returnValue(of([]));

    TestBed.configureTestingModule({
      declarations: [TrainerDataComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        DatePipe,
        provideMockStore(),
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackbarSpy },
        { provide: TrainerService, useValue: trainerServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: LocationService, useValue: locationServiceSpy }
      ]
    });
    ngxService = ngxServiceSpy;
    snackbar = snackbarSpy;
    trainerService = trainerServiceSpy;
    fixture = TestBed.createComponent(TrainerDataComponent);
    component = fixture.componentInstance;
    component.trainer = {
      id: 1, name: 'Coach Jo', motto: 'Strong body, strong mind', experience: '5', likes: 0,
      categories: [{ id: 3 }], date: new Date().toISOString()
    } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('saving the trainer details', () => {
    // /trainer/update answers with an ApiResponse wrapper; the saved trainer is in `data`.
    const saved = {
      id: 1, name: 'Renamed Coach', motto: 'New motto', experience: '6', likes: 0,
      categories: [{ id: 3 }], serviceMode: 'IN_PERSON', locations: [], date: new Date().toISOString()
    } as any;
    const wrapped = { message: 'Trainer updated', data: saved, success: true, statusCode: 200 };

    it('shows the saved trainer and stops the loading overlay', () => {
      trainerService.updateTrainer.and.returnValue(of(wrapped));

      component.updateTrainer();

      expect(ngxService.start).toHaveBeenCalledTimes(1);
      expect(ngxService.stop).toHaveBeenCalledTimes(1);
      expect(component.trainer).toBe(saved);
      expect(component.updateTrainerForm.get('name')?.value).toBe('Renamed Coach');
      expect(snackbar.openSnackBar).toHaveBeenCalledWith('Trainer updated', '');
    });

    it('stops the loading overlay even if something after the save throws', () => {
      trainerService.updateTrainer.and.returnValue(of(wrapped));
      spyOn(component, 'updateFormValues').and.throwError('could not apply the saved trainer');
      // RxJS rethrows an error from a next-handler asynchronously; swallow it so the spec can assert on the loader.
      spyOn(window, 'setTimeout').and.callFake(((fn: () => void) => { try { fn(); } catch { /* expected */ } return 0; }) as any);

      component.updateTrainer();

      expect(ngxService.stop).toHaveBeenCalledTimes(1);
    });

    it('stops the loading overlay when the save fails', () => {
      trainerService.updateTrainer.and.returnValue(throwError(() => ({ error: { message: 'Nope' } })));

      component.updateTrainer();

      expect(ngxService.stop).toHaveBeenCalledTimes(1);
      // A failed save is shown inline by the form (and stays until fixed), not as a transient snackbar.
      expect(component.submitError).toBe('Nope');
      expect(snackbar.openSnackBar).not.toHaveBeenCalled();
    });
  });

  describe('where the trainer works', () => {
    const sentPayload = () => trainerService.updateTrainer.calls.mostRecent().args[0] as any;
    const area = (over: any = {}) => ({ country: 'Canada', stateProvince: 'British Columbia', city: 'Vancouver', clientAllowed: true, clientFee: null, spots: [], ...over });

    beforeEach(() => {
      trainerService.updateTrainer.and.returnValue(of({ message: 'ok', data: component.trainer as any, success: true, statusCode: 200 }));
    });

    it('adds several cities in one go and skips ones already listed', () => {
      component.addArea(area());
      component.quickAdd = { country: 'Canada', state: 'British Columbia', cities: ['Vancouver', 'Burnaby', 'Richmond'] };

      component.addQuickCities();

      expect(component.areasArray.controls.map(c => c.value.city)).toEqual(['Vancouver', 'Burnaby', 'Richmond']);
      expect(component.quickAdd.cities).toEqual([]);
      expect(component.quickAdd.state).toBe('British Columbia', 'the state stays for the next batch');
    });

    it('lets one city hold several spots, and sends one row per spot', () => {
      component.addArea(area());
      component.addSpot(0);
      component.addSpot(0);
      component.spotsArray(0).at(0).patchValue({ venue: "Gold's Gym", address: '1234 W Broadway', fee: 5 });
      component.spotsArray(0).at(1).patchValue({ venue: 'Kits Beach', address: 'near Kitsilano', precision: 'AREA' });

      component.updateTrainer();

      const rows = sentPayload().locations;
      expect(rows.length).toBe(2);
      expect(rows[0]).toEqual(jasmine.objectContaining({ city: 'Vancouver', venue: "Gold's Gym", locationPrecision: 'EXACT', fee: 5 }));
      expect(rows[1]).toEqual(jasmine.objectContaining({ venue: 'Kits Beach', locationPrecision: 'AREA' }));
    });

    it('writes the per-city client-place rule onto each row of that city', () => {
      component.addArea(area({ clientFee: 10 }));
      component.addSpot(0);
      component.spotsArray(0).at(0).patchValue({ venue: 'Gym' });
      component.addArea(area({ city: 'Burnaby', clientAllowed: false }));

      component.updateTrainer();

      const rows = sentPayload().locations;
      expect(rows.find((r: any) => r.city === 'Vancouver').clientLocationFee).toBe(10);
      expect(rows.find((r: any) => r.city === 'Burnaby').clientLocationAllowed).toBeFalse();
    });

    it('sends the outside-cities rule: blank fee = same as default, zero = free', () => {
      component.updateTrainerForm.patchValue({ customLocationAllowed: true, customLocationFee: 20, customLocationOutsideFee: '' });
      component.updateTrainer();
      expect(sentPayload().customLocationOutsideAllowed).toBeTrue();
      expect(sentPayload().customLocationOutsideFee).toBeNull();

      component.updateTrainerForm.patchValue({ customLocationOutsideFee: 0 });
      component.updateTrainer();
      expect(sentPayload().customLocationOutsideFee).toBe(0);

      component.updateTrainerForm.patchValue({ customLocationOutsideAllowed: false });
      component.updateTrainer();
      expect(sentPayload().customLocationOutsideAllowed).toBeFalse();
    });

    it('rebuilds the cities and spots from the saved trainer', () => {
      component.updateFormValues({
        ...component.trainer, serviceMode: 'IN_PERSON',
        locations: [
          { country: 'Canada', stateProvince: 'British Columbia', city: 'Vancouver', venue: 'Gym', address: 'A St', locationPrecision: 'EXACT' },
          { country: 'Canada', stateProvince: 'British Columbia', city: 'Vancouver', venue: 'Park', locationPrecision: null },
        ],
      } as any);

      expect(component.areasArray.length).toBe(1);
      expect(component.spotsArray(0).length).toBe(2);
    });
  });
});
