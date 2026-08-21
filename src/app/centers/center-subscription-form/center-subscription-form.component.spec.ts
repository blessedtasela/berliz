import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { CenterSubscriptionFormComponent } from './center-subscription-form.component';

describe('CenterSubscriptionFormComponent', () => {
  let component: CenterSubscriptionFormComponent;
  let fixture: ComponentFixture<CenterSubscriptionFormComponent>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [CenterSubscriptionFormComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        { provide: Router, useValue: routerSpy }
      ]
    });
    fixture = TestBed.createComponent(CenterSubscriptionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
