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
  });
});
