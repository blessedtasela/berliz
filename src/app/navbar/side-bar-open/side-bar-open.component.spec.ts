import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { NEVER, of } from 'rxjs';

import { SideBarOpenComponent } from './side-bar-open.component';
import { UserService } from 'src/app/services/user.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';

describe('SideBarOpenComponent', () => {
  let component: SideBarOpenComponent;
  let fixture: ComponentFixture<SideBarOpenComponent>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], { url: '/', events: of({}) });
    const userServiceSpy = jasmine.createSpyObj('UserService', ['logout']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const rxStompSpy = jasmine.createSpyObj('RxStompService', ['watch']);
    rxStompSpy.watch.and.returnValue(NEVER);

    TestBed.configureTestingModule({
      declarations: [SideBarOpenComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: Router, useValue: routerSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: SnackBarService, useValue: snackbarSpy },
        { provide: RxStompService, useValue: rxStompSpy }
      ]
    });
    fixture = TestBed.createComponent(SideBarOpenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('child sub-menus (e.g. My Trainer Profile -> Introduction, Pricing, ...)', () => {
    const item = {
      name: 'My Trainer Profile', route: '/dashboard/partnership',
      children: [
        { name: 'Introduction', route: '/dashboard/partnership/trainer-details', fragment: 'introduction' },
        { name: 'Pricing', route: '/dashboard/partnership/trainer-details', fragment: 'pricing' },
      ],
    };

    it('is hidden by default when the parent route is not active', () => {
      component.currentRoute = '/dashboard';
      expect(component.isChildrenVisible(item)).toBeFalse();
    });

    it('auto-expands while the parent route is active, with no manual toggle needed', () => {
      component.currentRoute = '/dashboard/partnership';
      expect(component.isChildrenVisible(item)).toBeTrue();
    });

    it('expands on a manual chevron toggle even when the parent route is not active', () => {
      component.currentRoute = '/dashboard';
      component.toggleChildren(item, new Event('click'));
      expect(component.isChildrenVisible(item)).toBeTrue();
    });

    it('collapses again on a second toggle', () => {
      component.currentRoute = '/dashboard';
      component.toggleChildren(item, new Event('click'));
      component.toggleChildren(item, new Event('click'));
      expect(component.isChildrenVisible(item)).toBeFalse();
    });

    it('marks a child active only when both its route and fragment match currentRoute', () => {
      component.currentRoute = '/dashboard/partnership/trainer-details#pricing';
      expect(component.isChildActive(item.children[1])).toBeTrue();
      expect(component.isChildActive(item.children[0])).toBeFalse();
    });

    it('does not consider a child active from the base route alone (no fragment)', () => {
      component.currentRoute = '/dashboard/partnership/trainer-details';
      expect(component.isChildActive(item.children[0])).toBeFalse();
    });
  });
});
