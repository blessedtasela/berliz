import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { Trainers } from 'src/app/models/trainers.interface';
import { TrainerService } from 'src/app/services/trainer.service';
import { BookingLocationPickerComponent, BookingLocationSelection } from './booking-location-picker.component';

describe('BookingLocationPickerComponent', () => {
  let fixture: ComponentFixture<BookingLocationPickerComponent>;
  let component: BookingLocationPickerComponent;
  let trainerService: jasmine.SpyObj<TrainerService>;
  let emitted: BookingLocationSelection[];

  const trainer = (over: Partial<Trainers> = {}): Trainers => ({
    id: 9,
    locations: [
      { id: 41, venue: "Mike's Gym", city: 'Austin', stateProvince: 'TX', country: 'USA', fee: 15 },
      { id: 42, city: 'Dallas', country: 'USA' },
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

  beforeEach(() => {
    trainerService = jasmine.createSpyObj('TrainerService', ['getActiveTrainers']);
    TestBed.configureTestingModule({
      imports: [BookingLocationPickerComponent],
      providers: [{ provide: TrainerService, useValue: trainerService }],
    });
    fixture = TestBed.createComponent(BookingLocationPickerComponent);
    component = fixture.componentInstance;
    emitted = [];
    component.selectionChange.subscribe(s => emitted.push(s));
  });

  afterEach(() => fixture.destroy());

  it('lists each location with its fee, and the custom option when allowed', () => {
    const el = render(trainer());
    const text = el.textContent ?? '';
    expect(text).toContain("Mike's Gym, Austin, TX, USA");
    expect(text).toContain('+$15.00');
    expect(text).toContain('Dallas, USA');
    expect(text).toContain('No extra fee');
    expect(text).toContain('my own location');
    expect(text).toContain('+$25.00');
  });

  it('renders nothing when the trainer offers no locations and no custom option', () => {
    const el = render(trainer({ locations: [], customLocationAllowed: false }));
    expect(el.querySelector('button')).toBeNull();
    expect((el.textContent ?? '').trim()).toBe('');
  });

  it('hides the custom option when the trainer does not allow it', () => {
    const el = render(trainer({ customLocationAllowed: false }));
    expect(el.textContent).not.toContain('my own location');
  });

  it('emits the chosen listed location and clears it when tapped again', () => {
    render(trainer());
    component.selectListed(component.locations[0]);
    expect(emitted.pop()).toEqual({ trainerLocationId: 41, customLocation: undefined, incomplete: false });

    component.selectListed(component.locations[0]);
    expect(emitted.pop()).toEqual({ trainerLocationId: undefined, customLocation: undefined, incomplete: false });
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

  it('flags a custom location as incomplete until an address is typed', () => {
    render(trainer());
    component.selectCustom();
    expect(emitted.pop()).toEqual({ trainerLocationId: undefined, customLocation: undefined, incomplete: true });

    component.customText = '  12 Elm St ';
    component.emit();
    expect(emitted.pop()).toEqual({ trainerLocationId: undefined, customLocation: '12 Elm St', incomplete: false });
  });

  it('picking a listed location drops a custom one and vice versa', () => {
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
});
