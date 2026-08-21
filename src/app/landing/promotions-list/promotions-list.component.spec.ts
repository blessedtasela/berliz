import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { PromotionsListComponent } from './promotions-list.component';

describe('PromotionsListComponent', () => {
  let component: PromotionsListComponent;
  let fixture: ComponentFixture<PromotionsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PromotionsListComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(PromotionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
