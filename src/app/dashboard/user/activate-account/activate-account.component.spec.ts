import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';

import { ActivateAccountComponent } from './activate-account.component';

describe('ActivateAccountComponent', () => {
  let component: ActivateAccountComponent;
  let fixture: ComponentFixture<ActivateAccountComponent>;

  function configure(queryParams: Record<string, string> = {}) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [ActivateAccountComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: NgxUiLoaderService, useValue: jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']) },
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) },
        { provide: UserService, useValue: jasmine.createSpyObj('UserService', ['activateAccount']) },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } } },
      ]
    });
    fixture = TestBed.createComponent(ActivateAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => configure());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('leaves the resend email blank when arriving with no ?email= (e.g. "Back to login" then here directly)', () => {
    expect(component.knownEmail).toBeNull();
    expect(component.resendForm.value.email).toBe('');
  });

  it('pre-fills the resend email when arriving straight from signup with ?email=', () => {
    configure({ email: 'new.user@example.com' });

    expect(component.knownEmail).toBe('new.user@example.com');
    expect(component.resendForm.value.email).toBe('new.user@example.com');
  });
});
