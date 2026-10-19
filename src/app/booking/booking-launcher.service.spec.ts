import { Router } from '@angular/router';
import { BookingLauncherService } from './booking-launcher.service';

describe('BookingLauncherService', () => {

  let navigate: jasmine.Spy;
  let launcher: BookingLauncherService;

  beforeEach(() => {
    navigate = jasmine.createSpy('navigate');
    launcher = new BookingLauncherService({ navigate } as unknown as Router);
  });

  it('opens the trainer booking page, never a pop-up, for anyone', () => {
    launcher.startBooking({ trainerId: 9, providerName: 'Jo Smith' });

    expect(navigate).toHaveBeenCalledWith(['/trainers', 'Jo-Smith', 'book'], { queryParams: undefined });
  });

  it('opens the center booking page for a center', () => {
    launcher.startBooking({ centerId: 4, providerName: 'Iron Works Gym' });

    expect(navigate.calls.mostRecent().args[0]).toEqual(['/centers', 'Iron-Works-Gym', 'book']);
  });

  it('opens Level Up, on a plan when one is given', () => {
    launcher.startLevelUp({ trainerId: 9, providerName: 'Jo Smith' });
    expect(navigate.calls.mostRecent().args).toEqual([['/trainers', 'Jo-Smith', 'level-up'], { queryParams: undefined }]);

    launcher.startLevelUp({ trainerId: 9, providerName: 'Jo Smith' }, 7);
    expect(navigate.calls.mostRecent().args).toEqual([['/trainers', 'Jo-Smith', 'level-up'], { queryParams: { plan: 7 } }]);
  });

  it('goes nowhere without a provider name', () => {
    launcher.startBooking({ trainerId: 9, providerName: '' });

    expect(navigate).not.toHaveBeenCalled();
  });
});
