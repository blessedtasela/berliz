import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { SubscriptionDetailPageComponent } from './subscription-detail-page.component';
import { selectSubscriptions } from 'src/app/state/subscription/subscription.selectors';

describe('SubscriptionDetailPageComponent', () => {
  let component: SubscriptionDetailPageComponent;
  let fixture: ComponentFixture<SubscriptionDetailPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubscriptionDetailPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore({ selectors: [{ selector: selectSubscriptions, value: [] }] }),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } }
      ]
    });

    fixture = TestBed.createComponent(SubscriptionDetailPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
