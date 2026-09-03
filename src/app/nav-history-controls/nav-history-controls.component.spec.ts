import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { NavHistoryControlsComponent } from './nav-history-controls.component';

describe('NavHistoryControlsComponent', () => {
  let component: NavHistoryControlsComponent;
  let fixture: ComponentFixture<NavHistoryControlsComponent>;
  let router: Router;
  let location: Location;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NavHistoryControlsComponent,
        // A permissive wildcard so navigateByUrl below can resolve to *something*
        // -- what it resolves to doesn't matter, only that NavigationEnd fires.
        RouterTestingModule.withRoutes([{ path: '**', component: NavHistoryControlsComponent }])
      ]
    });

    fixture = TestBed.createComponent(NavHistoryControlsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    // The Router itself depends on the real Location service internally, so
    // spy on its methods rather than substituting a fake -- swapping the
    // whole token breaks the Router's own URL bookkeeping.
    location = TestBed.inject(Location);
    spyOn(location, 'back');
    spyOn(location, 'forward');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('disables back on the page the app booted into (no in-app navigation yet)', () => {
    expect(component.canGoBack).toBeFalse();
    component.goBack();
    expect(location.back).not.toHaveBeenCalled();
  });

  it('enables back once the app has completed more than one navigation', async () => {
    await router.navigateByUrl('/somewhere');
    await router.navigateByUrl('/somewhere-else');

    expect(component.canGoBack).toBeTrue();
    component.goBack();
    expect(location.back).toHaveBeenCalled();
  });

  it('forward always delegates straight to Location -- a no-op is Location\'s job, not ours', () => {
    component.goForward();
    expect(location.forward).toHaveBeenCalled();
  });
});
