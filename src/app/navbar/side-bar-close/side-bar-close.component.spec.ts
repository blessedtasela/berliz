import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { SideBarCloseComponent } from './side-bar-close.component';
import { UserService } from 'src/app/services/user.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('SideBarCloseComponent', () => {
  let component: SideBarCloseComponent;
  let fixture: ComponentFixture<SideBarCloseComponent>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], { url: '/', events: of({}) });
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['logout']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [SideBarCloseComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: SnackBarService, useValue: snackbarSpy }
      ]
    });
    fixture = TestBed.createComponent(SideBarCloseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
