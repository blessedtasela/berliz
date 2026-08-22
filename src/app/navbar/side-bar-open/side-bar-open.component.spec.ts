import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { SideBarOpenComponent } from './side-bar-open.component';
import { UserService } from 'src/app/services/user.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { AuthService } from 'src/app/services/auth.service';

describe('SideBarOpenComponent', () => {
  let component: SideBarOpenComponent;
  let fixture: ComponentFixture<SideBarOpenComponent>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], { url: '/', events: of({}) });
    const userServiceSpy = jasmine.createSpyObj('UserService', ['logout']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const rxStompSpy = jasmine.createSpyObj('RxStompService', ['watch']);
    rxStompSpy.watch.and.returnValue(of({}));
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    authServiceSpy.isAuthenticated.and.returnValue(true);

    TestBed.configureTestingModule({
      declarations: [SideBarOpenComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: Router, useValue: routerSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: SnackBarService, useValue: snackbarSpy },
        { provide: RxStompService, useValue: rxStompSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(SideBarOpenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
