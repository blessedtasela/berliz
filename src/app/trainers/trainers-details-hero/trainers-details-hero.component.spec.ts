import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { TrainersDetailsHeroComponent } from './trainers-details-hero.component';

describe('TrainersDetailsHeroComponent', () => {
  let component: TrainersDetailsHeroComponent;
  let fixture: ComponentFixture<TrainersDetailsHeroComponent>;

  beforeEach(() => {
    const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [TrainersDetailsHeroComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MatDialog, useValue: matDialogSpy }
      ]
    });
    fixture = TestBed.createComponent(TrainersDetailsHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe("Available in dropdown", () => {
    const trainer: any = {
      id: 9,
      name: "Coach",
      locations: [
        { id: 1, venue: "Mike's Gym", city: "Surrey", stateProvince: "BC", country: "Canada", fee: 15 },
        { id: 2, city: "Vancouver", stateProvince: "BC", country: "Canada" },
        { id: 3, city: "Burnaby", country: "Canada" },
      ],
      customLocationAllowed: true,
      customLocationFee: 25,
    };

    function open(): HTMLElement {
      component.trainer = trainer;
      fixture.detectChanges();
      component.toggleLocations();
      fixture.detectChanges();
      return fixture.nativeElement as HTMLElement;
    }

    it("labels the tile with how many more locations there are", () => {
      component.trainer = trainer;
      fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).textContent).toContain("+2 more");
    });

    it("lists every location with venue and fee once opened", () => {
      const text = open().textContent ?? "";
      expect(text).toContain("Mike's Gym");
      expect(text).toContain("Surrey, BC, Canada");
      expect(text).toContain("+$15.00");
      expect(text).toContain("Vancouver, BC, Canada");
      expect(text).toContain("Burnaby, Canada");
      expect(text).toContain("Or train at a place of your choice");
      expect(text).toContain("+$25.00");
    });

    it("includes the venue in the Maps search", () => {
      expect(decodeURIComponent(component.mapsUrlFor(trainer.locations[0]))).toContain("Mike's Gym, Surrey, BC, Canada");
      expect(decodeURIComponent(component.mapsUrlFor(trainer.locations[1]))).toContain("query=Vancouver, BC, Canada");
    });

    it("shows a spot's address, and marks a general area as approximate", () => {
      component.trainer = {
        ...trainer,
        locations: [
          { id: 1, venue: "Gold's Gym", address: '1234 W Broadway', locationPrecision: 'EXACT', city: 'Vancouver', stateProvince: 'BC', country: 'Canada' },
          { id: 2, address: 'near Kitsilano Beach', locationPrecision: 'AREA', city: 'Vancouver', stateProvince: 'BC', country: 'Canada' },
        ],
      };
      fixture.detectChanges();
      component.toggleLocations();
      fixture.detectChanges();

      const text = (fixture.nativeElement as HTMLElement).textContent ?? "";
      expect(text).toContain('1234 W Broadway');
      expect(text).toContain('near Kitsilano Beach');
      expect(text).toContain('Approximate area');
      expect(decodeURIComponent(component.mapsUrlFor(component.trainer!.locations![0]))).toContain("Gold's Gym, 1234 W Broadway, Vancouver");
    });

    describe("coming to the client's place", () => {
      const withFees = (over: any) => { component.trainer = { ...trainer, ...over }; return component; };

      it("shows one fee when it's the same everywhere", () => {
        expect(withFees({}).clientPlaceFeeLabel).toBe('+$25.00');
      });

      it("shows the range when a city or the outside costs differently", () => {
        const c = withFees({
          locations: [{ id: 1, city: 'Vancouver', stateProvince: 'BC', country: 'Canada', clientLocationFee: 10 }],
          customLocationOutsideFee: 40,
        });
        expect(c.clientPlaceFeeLabel).toBe('+$10.00 – $40.00');
      });

      it("says 'up to' when some places are free", () => {
        const c = withFees({
          locations: [{ id: 1, city: 'Vancouver', stateProvince: 'BC', country: 'Canada', clientLocationFee: 0 }],
          customLocationOutsideFee: 40,
        });
        expect(c.clientPlaceFeeLabel).toBe('up to +$40.00');
      });

      it("ignores the outside fee when the trainer only works inside their cities, and a city they don't travel in", () => {
        const c = withFees({
          customLocationOutsideAllowed: false,
          locations: [
            { id: 1, city: 'Vancouver', stateProvince: 'BC', country: 'Canada', clientLocationFee: 10 },
            { id: 2, city: 'Burnaby', country: 'Canada', clientLocationAllowed: false, clientLocationFee: 99 },
          ],
        });
        expect(c.clientPlaceFeeLabel).toBe('+$10.00');
      });

      it("offers nothing when every city is off and they don't travel outside", () => {
        const c = withFees({ customLocationOutsideAllowed: false, locations: [{ id: 1, city: 'Vancouver', country: 'Canada', clientLocationAllowed: false }] });
        expect(c.offersClientPlace).toBeFalse();
      });

      it("offers nothing when the trainer doesn't train at client places at all", () => {
        expect(withFees({ customLocationAllowed: false }).offersClientPlace).toBeFalse();
      });
    });
  });
});
