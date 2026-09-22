import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { NEVER, of } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { ProfileComponent } from './profile.component';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { BerlizFeedbackModalComponent } from 'src/app/footer/berliz-feedback-modal/berliz-feedback-modal.component';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['updateProfilePhoto', 'removePhoto', 'logout']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const rxStompSpy = jasmine.createSpyObj('RxStompService', ['watch']);
    rxStompSpy.watch.and.returnValue(NEVER);

    TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackbarSpy },
        { provide: RxStompService, useValue: rxStompSpy }
      ]
    });
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isProvider', () => {
    it('is true for a trainer', () => {
      component.userData = { role: 'trainer' } as any;
      expect(component.isProvider).toBeTrue();
    });

    it('is true for a center', () => {
      component.userData = { role: 'Center' } as any;
      expect(component.isProvider).toBeTrue();
    });

    it('is false for a plain member/client', () => {
      component.userData = { role: 'user' } as any;
      expect(component.isProvider).toBeFalse();
    });

    it('is false with no userData', () => {
      component.userData = null;
      expect(component.isProvider).toBeFalse();
    });
  });

  it('openFeedback closes the dropdown and opens the feedback modal', () => {
    component.profileOpen = true;
    component.openFeedback();

    expect(component.profileOpen).toBeFalse();
    expect(dialogSpy.open).toHaveBeenCalledWith(BerlizFeedbackModalComponent, jasmine.objectContaining({ width: '460px' }));
  });

  it('only shows the Partnership link for a provider (trainer/center)', () => {
    component.userData = { firstname: 'A', lastname: 'B', role: 'trainer' } as any;
    component.profileOpen = true;
    fixture.detectChanges();
    let partnershipLink = fixture.nativeElement.querySelector('a[routerLink="/dashboard/partnership"]');
    expect(partnershipLink).toBeTruthy();

    component.userData = { firstname: 'A', lastname: 'B', role: 'user' } as any;
    fixture.detectChanges();
    partnershipLink = fixture.nativeElement.querySelector('a[routerLink="/dashboard/partnership"]');
    expect(partnershipLink).toBeFalsy();
  });
});
