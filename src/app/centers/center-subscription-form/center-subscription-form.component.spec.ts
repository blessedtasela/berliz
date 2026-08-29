import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { CenterSubscriptionFormComponent } from './center-subscription-form.component';

describe('CenterSubscriptionFormComponent', () => {
  let component: CenterSubscriptionFormComponent;
  let fixture: ComponentFixture<CenterSubscriptionFormComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [CenterSubscriptionFormComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ]
    });
    fixture = TestBed.createComponent(CenterSubscriptionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Regression: this used to be a blocking window.confirm() -- now it's the
  // app's own PromptModalComponent, opened through MatDialog instead.
  it('submitForm asks for confirmation via the custom prompt modal, not window.confirm', () => {
    spyOnProperty(component.centerSubscriptionForm, 'invalid', 'get').and.returnValue(false);
    dialogSpy.open.and.returnValue({ afterClosed: () => of(false) } as any);

    component.submitForm();

    expect(dialogSpy.open).toHaveBeenCalled();
    expect((dialogSpy.open.calls.mostRecent().args[1] as any)?.data?.confirmation).toBeTrue();
  });
});
