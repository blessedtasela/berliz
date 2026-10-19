import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { Trainers } from 'src/app/models/trainers.interface';
import { LocationService } from 'src/app/services/location.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { BookingLocationPickerComponent, BookingLocationSelection, locationPayload } from './booking-location-picker.component';

describe('BookingLocationPickerComponent', () => {
  let fixture: ComponentFixture<BookingLocationPickerComponent>;
  let component: BookingLocationPickerComponent;
  let trainerService: jasmine.SpyObj<TrainerService>;
  let emitted: BookingLocationSelection[];

  const trainer = (over: Partial<Trainers> = {}): Trainers => ({
    id: 9,
    locations: [
      { id: 41, venue: "Mike's Gym", address: '12 Main St', city: 'Austin', stateProvince: 'TX', country: 'USA', fee: 15 },
      { id: 42, city: 'Dallas', stateProvince: 'TX', country: 'USA' },
    ],
    customLocationAllowed: true,
    customLocationFee: 25,
    ...over,
  } as Trainers);

  function render(t: Trainers | null, trainerId: number | null = 9): HTMLElement {
    trainerService.getActiveTrainers.and.returnValue(of({ data: t ? [t] : [] } as any));
    component.trainerId = trainerId;
    component.ngOnInit();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  const austin = { country: 'USA', stateProvince: 'TX', city: 'Austin' };

  beforeEach(() => {
    trainerService = jasmine.createSpyObj('TrainerService', ['getActiveTrainers']);
    const locationService = jasmine.createSpyObj('LocationService', ['getStates', 'getCities'], { countries$: of([{ id: 1, name: 'USA', code: 'US' }]) });
    locationService.getStates.and.returnValue(of([{ id: 5, name: 'TX' }]));
    locationService.getCities.and.returnValue(of([{ id: 8, name: 'Austin' }]));
    TestBed.configureTestingModule({
      imports: [BookingLocationPickerComponent],
      providers: [
        { provide: TrainerService, useValue: trainerService },
        { provide: LocationService, useValue: locationService },
      ],
    });
    fixture = TestBed.createComponent(BookingLocationPickerComponent);
    component = fixture.componentInstance;
    emitted = [];
    component.selectionChange.subscribe(s => emitted.push(s));
  });

  afterEach(() => fixture.destroy());

  it('lists each spot under its city with its fee, and the own-place option when allowed', () => {
    const el = render(trainer());
    const text = el.textContent ?? '';
    expect(text).toContain('Austin, TX, USA');
    expect(text).toContain("Mike's Gym");
    expect(text).toContain('12 Main St');
    expect(text).toContain('+$15.00');
    expect(text).toContain('Anywhere in Dallas');
    expect(text).toContain('No extra fee');
    expect(text).toContain('my own place');
    expect(text).toContain('+$25.00');
  });

  it('marks an approximate spot as an approximate area', () => {
    const el = render(trainer({
      locations: [{ id: 1, venue: 'Kits Beach', address: 'near Kitsilano', locationPrecision: 'AREA', city: 'Vancouver', country: 'Canada' } as any],
    }));
    expect(el.textContent).toContain('near Kitsilano · approximate area');
  });

  it('renders nothing when the trainer offers no locations and no own-place option', () => {
    const el = render(trainer({ locations: [], customLocationAllowed: false }));
    expect(el.querySelector('button')).toBeNull();
    expect((el.textContent ?? '').trim()).toBe('');
  });

  it('hides the own-place option when the trainer does not allow it', () => {
    const el = render(trainer({ customLocationAllowed: false }));
    expect(el.textContent).not.toContain('my own place');
  });

  it('emits the chosen listed location and clears it when tapped again', () => {
    render(trainer());
    component.selectListed(component.locations[0]);
    expect(emitted.pop()).toEqual(jasmine.objectContaining({ trainerLocationId: 41, customLocation: undefined, incomplete: false, fee: 15 }));

    component.selectListed(component.locations[0]);
    expect(emitted.pop()).toEqual(jasmine.objectContaining({ trainerLocationId: undefined, incomplete: false, fee: null }));
  });

  it('shows the fee warning for a priced location but not a free one', () => {
    const el = render(trainer());
    component.selectListed(component.locations[0]);
    fixture.detectChanges();
    expect(el.textContent).toContain('adds a $15.00 fee');

    component.selectListed(component.locations[1]);
    fixture.detectChanges();
    expect(el.textContent).not.toContain('fee on top');
  });

  describe("at the client's own place", () => {
    it('is incomplete until the address and the city are given', () => {
      render(trainer());
      component.selectCustom();
      expect(emitted.pop()!.incomplete).toBeTrue();

      component.customText = '  12 Elm St ';
      component.emit();
      expect(emitted.pop()!.incomplete).toBeTrue();

      component.onCountry('USA');
      component.onState('TX');
      component.onCity('Austin');
      expect(emitted.pop()).toEqual({
        trainerLocationId: undefined, customLocation: '12 Elm St',
        customLocationCountry: 'USA', customLocationState: 'TX', customLocationCity: 'Austin',
        incomplete: false, fee: 25,
      });
    });

    it("charges the city's own fee inside a listed city, else the outside fee, else the usual fee", () => {
      render(trainer({
        customLocationOutsideFee: 60,
        locations: [{ id: 41, city: 'Austin', stateProvince: 'TX', country: 'USA', clientLocationFee: 10 } as any],
      }));
      component.selectCustom();
      component.customText = '1 Home Rd';

      component.useCity(austin);
      expect(emitted.pop()!.fee).toBe(10);

      component.onCity('Houston');
      expect(emitted.pop()!.fee).toBe(60);
    });

    it('treats a city fee of zero as free rather than falling back to the usual fee', () => {
      render(trainer({ locations: [{ id: 41, city: 'Austin', stateProvince: 'TX', country: 'USA', clientLocationFee: 0 } as any] }));
      component.selectCustom();
      component.customText = '1 Home Rd';

      component.useCity(austin);

      expect(emitted.pop()!.fee).toBeNull();
    });

    it("refuses a city the trainer doesn't travel to, and everywhere outside their cities when they only work inside them", () => {
      render(trainer({
        customLocationOutsideAllowed: false,
        locations: [
          { id: 41, city: 'Austin', stateProvince: 'TX', country: 'USA', clientLocationAllowed: false } as any,
          { id: 42, city: 'Dallas', stateProvince: 'TX', country: 'USA' } as any,
        ],
      }));
      component.selectCustom();
      component.customText = '1 Home Rd';

      component.useCity(austin);
      fixture.detectChanges();
      expect(emitted.pop()!.incomplete).toBeTrue();
      expect(fixture.nativeElement.textContent).toContain("don't travel to clients' places in Austin");

      component.onCity('Houston');
      fixture.detectChanges();
      expect(emitted.pop()!.incomplete).toBeTrue();
      expect(fixture.nativeElement.textContent).toContain('only train in the cities they list');

      component.onCity('Dallas');
      expect(emitted.pop()!.incomplete).toBeFalse();
    });

    it("offers one tap for each city the trainer comes to, leaving out the ones switched off", () => {
      render(trainer({
        locations: [
          { id: 1, city: 'Austin', stateProvince: 'TX', country: 'USA' } as any,
          { id: 2, city: 'Dallas', stateProvince: 'TX', country: 'USA', clientLocationAllowed: false } as any,
        ],
      }));
      expect(component.cityShortcuts.map(c => c.city)).toEqual(['Austin']);
    });
  });

  it('picking a listed location drops an own place and vice versa', () => {
    render(trainer());
    component.selectCustom();
    component.selectListed(component.locations[1]);
    expect(component.customSelected).toBeFalse();
    component.selectCustom();
    expect(component.selectedId).toBeNull();
  });

  it('uses the trainer input without fetching', () => {
    component.trainer = trainer();
    component.ngOnInit();
    fixture.detectChanges();
    expect(trainerService.getActiveTrainers).not.toHaveBeenCalled();
    expect(component.locations.length).toBe(2);
  });

  it('hides itself (rather than breaking booking) when the trainer lookup fails', () => {
    trainerService.getActiveTrainers.and.returnValue(throwError(() => new Error('boom')));
    component.trainerId = 9;
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.hasOptions).toBeFalse();
  });

  it("restores a preselected listed location and emits it", () => {
    component.preselect = { trainerLocationId: 41 };
    render(trainer());
    expect(component.selectedId).toBe(41);
    expect(emitted.pop()).toEqual(jasmine.objectContaining({ trainerLocationId: 41, incomplete: false, fee: 15 }));
  });

  it("restores a preselected own place, with where it is, when the trainer allows it", () => {
    component.preselect = { customLocation: "12 Elm St", customLocationCountry: 'USA', customLocationState: 'TX', customLocationCity: 'Houston' };
    render(trainer());
    expect(component.customSelected).toBeTrue();
    expect(component.customText).toBe("12 Elm St");
    expect(emitted.pop()).toEqual(jasmine.objectContaining({
      customLocation: '12 Elm St', customLocationCity: 'Houston', incomplete: false, fee: 25,
    }));
  });

  it("ignores a preselect that no longer exists", () => {
    component.preselect = { trainerLocationId: 999 };
    render(trainer());
    expect(component.selectedId).toBeNull();
    expect(emitted.length).toBe(0);
  });

  it("ignores a preselected own place when the trainer no longer allows it", () => {
    component.preselect = { customLocation: "12 Elm St" };
    render(trainer({ customLocationAllowed: false }));
    expect(component.customSelected).toBeFalse();
  });

  describe('locationPayload', () => {
    it('is empty with no choice, and carries every location field otherwise', () => {
      expect(locationPayload(null)).toEqual({});
      expect(locationPayload({
        customLocation: 'Home', customLocationCountry: 'USA', customLocationState: 'TX', customLocationCity: 'Austin', incomplete: false, fee: 5,
      })).toEqual({
        trainerLocationId: undefined, customLocation: 'Home', customLocationCountry: 'USA', customLocationState: 'TX', customLocationCity: 'Austin',
      });
    });
  });
});
