import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { TrainerPulseHeaderComponent } from './trainer-pulse-header.component';
import { AuthService } from 'src/app/services/auth.service';
import { selectDashboardData } from 'src/app/state/dashboard/dashboard.selectors';

describe('TrainerPulseHeaderComponent', () => {
  let component: TrainerPulseHeaderComponent;
  let fixture: ComponentFixture<TrainerPulseHeaderComponent>;
  let store: MockStore;
  let authService: jasmine.SpyObj<AuthService>;

  function setup(role: { trainer?: boolean; center?: boolean }) {
    authService = jasmine.createSpyObj('AuthService', ['isTrainer', 'isCenter']);
    authService.isTrainer.and.returnValue(!!role.trainer);
    authService.isCenter.and.returnValue(!!role.center);

    TestBed.configureTestingModule({
      imports: [TrainerPulseHeaderComponent, RouterTestingModule],
      providers: [
        provideMockStore({ selectors: [{ selector: selectDashboardData, value: null }] }),
        { provide: AuthService, useValue: authService },
      ],
    });

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(TrainerPulseHeaderComponent);
    component = fixture.componentInstance;
  }

  it('stays hidden for a plain user', () => {
    setup({});
    fixture.detectChanges();

    expect(component.visible).toBeFalse();
  });

  it('shows for a trainer', () => {
    setup({ trainer: true });
    fixture.detectChanges();

    expect(component.visible).toBeTrue();
  });

  it('shows for a center', () => {
    setup({ center: true });
    fixture.detectChanges();

    expect(component.visible).toBeTrue();
  });

  it('reads active clients, bookings and packages off the shared dashboard counts', () => {
    setup({ trainer: true });
    fixture.detectChanges();

    store.overrideSelector(selectDashboardData, { myClients: 7, myProviderBookings: 3, myPackages: 2 });
    store.refreshState();

    expect(component.activeClients).toBe(7);
    expect(component.bookings).toBe(3);
    expect(component.packages).toBe(2);
  });

  it('does not throw while the dashboard data has not loaded yet', () => {
    setup({ trainer: true });
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(component.activeClients).toBe(0);
  });
});
