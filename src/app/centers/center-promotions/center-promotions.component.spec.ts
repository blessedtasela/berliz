import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterPromotionsComponent } from './center-promotions.component';

describe('CenterPromotionsComponent', () => {
  let component: CenterPromotionsComponent;
  let fixture: ComponentFixture<CenterPromotionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterPromotionsComponent]
    });
    fixture = TestBed.createComponent(CenterPromotionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
