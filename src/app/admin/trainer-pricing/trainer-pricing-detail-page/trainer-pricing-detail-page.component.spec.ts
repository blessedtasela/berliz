import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { TrainerPricingDetailPageComponent } from './trainer-pricing-detail-page.component';
import { selectTrainerPricing } from 'src/app/state/trainer/trainer.selector';

describe('TrainerPricingDetailPageComponent', () => {
  let component: TrainerPricingDetailPageComponent;
  let fixture: ComponentFixture<TrainerPricingDetailPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerPricingDetailPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore({ selectors: [{ selector: selectTrainerPricing, value: [] }] }),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } }
      ]
    });

    fixture = TestBed.createComponent(TrainerPricingDetailPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
