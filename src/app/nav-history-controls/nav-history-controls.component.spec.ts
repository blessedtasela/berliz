import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { NavHistoryControlsComponent } from './nav-history-controls.component';
import { NavControlsService } from '../services/nav-controls.service';
import { SnackBarService } from '../services/snack-bar.service';

describe('NavHistoryControlsComponent', () => {
  let component: NavHistoryControlsComponent;
  let fixture: ComponentFixture<NavHistoryControlsComponent>;
  let router: Router;
  let location: Location;
  let navControls: jasmine.SpyObj<NavControlsService>;
  let snackBar: jasmine.SpyObj<SnackBarService>;

  beforeEach(() => {
    navControls = jasmine.createSpyObj('NavControlsService',
      ['setStyle', 'setPosition', 'setDocked'],
      {
        style$: of('button'),
        appearance$: of('translucent'),
        position$: of(null),
        docked$: of(null),
        dockY$: of(null),
      });
    snackBar = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      imports: [
        NavHistoryControlsComponent,
        // A permissive wildcard so navigateByUrl below can resolve to *something*
        // -- what it resolves to doesn't matter, only that NavigationEnd fires.
        RouterTestingModule.withRoutes([{ path: '**', component: NavHistoryControlsComponent }])
      ],
      providers: [
        { provide: NavControlsService, useValue: navControls },
        { provide: SnackBarService, useValue: snackBar },
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

  // ── Long-press-to-dismiss + edge-docking gestures ──────────────────────

  describe('long-press-to-dismiss and edge-docking gestures', () => {
    function fakeDragEnd(dropPoint: { x: number; y: number }, freeDragPosition = { x: 10, y: 20 }): any {
      return {
        dropPoint,
        source: { getFreeDragPosition: () => freeDragPosition },
      };
    }

    beforeEach(() => {
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('arms the dismiss target after a long press', () => {
      component.onPressStart();
      expect(component.dismissArmed).toBeFalse();
      jasmine.clock().tick(450);
      expect(component.dismissArmed).toBeTrue();
    });

    it('does not arm the dismiss target on a quick press-and-release', () => {
      component.onPressStart();
      jasmine.clock().tick(200);
      component.onPressEnd();
      jasmine.clock().tick(300);
      expect(component.dismissArmed).toBeFalse();
    });

    it('cancels the long-press timer once an ordinary drag starts', () => {
      component.onPressStart();
      component.onDragStarted({} as any);
      jasmine.clock().tick(450);
      expect(component.dismissArmed).toBeFalse();
    });

    it('does not let onPressEnd clear dismiss state once a drag has started (owned by onDragEnded instead)', () => {
      component.onPressStart();
      jasmine.clock().tick(450);
      expect(component.dismissArmed).toBeTrue();
      component.onDragStarted({} as any);
      component.onPressEnd();
      expect(component.dismissArmed).toBeTrue();
    });

    it('hides the control when released on the armed dismiss target', () => {
      component.onPressStart();
      jasmine.clock().tick(450);
      component.onDragStarted({} as any);
      component.dismissHover = true;

      component.onDragEnded(fakeDragEnd({ x: 400, y: 400 }));

      expect(navControls.setStyle).toHaveBeenCalledWith('off');
      expect(snackBar.openSnackBar).toHaveBeenCalled();
      expect(navControls.setPosition).not.toHaveBeenCalled();
      expect(component.dismissArmed).toBeFalse();
    });

    it('docks the control when dropped near the left edge', () => {
      component.onDragStarted({} as any);
      component.onDragEnded(fakeDragEnd({ x: 10, y: 300 }));

      expect(navControls.setDocked).toHaveBeenCalledWith('left', 300);
      expect(navControls.setPosition).not.toHaveBeenCalled();
    });

    it('docks the control when dropped near the right edge', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1000, configurable: true });
      component.onDragStarted({} as any);
      component.onDragEnded(fakeDragEnd({ x: 995, y: 150 }));

      expect(navControls.setDocked).toHaveBeenCalledWith('right', 150);
    });

    it('saves a plain reposition when dropped away from either edge and not dismissed', () => {
      component.onDragStarted({} as any);
      component.onDragEnded(fakeDragEnd({ x: 500, y: 300 }, { x: 500, y: 300 }));

      expect(navControls.setPosition).toHaveBeenCalledWith({ x: 500, y: 300 });
      expect(navControls.setDocked).not.toHaveBeenCalled();
      expect(navControls.setStyle).not.toHaveBeenCalled();
    });

    it('undocks when a docked pill is dragged out and released away from an edge', () => {
      component.docked = 'left';
      component.onDragStarted({} as any);
      component.onDragEnded(fakeDragEnd({ x: 500, y: 300 }, { x: 500, y: 300 }));

      expect(navControls.setDocked).toHaveBeenCalledWith(null);
      expect(navControls.setPosition).toHaveBeenCalledWith({ x: 500, y: 300 });
    });

    it('ignores press-and-hold while docked (tap-to-undock owns that gesture instead)', () => {
      component.docked = 'left';
      component.onPressStart();
      jasmine.clock().tick(450);
      expect(component.dismissArmed).toBeFalse();
    });

    it('undocks on tap of the collapsed peek tab', () => {
      component.onDockedTabClick();
      expect(navControls.setDocked).toHaveBeenCalledWith(null);
    });
  });
});
