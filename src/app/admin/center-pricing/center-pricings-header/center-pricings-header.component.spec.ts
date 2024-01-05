import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterPricingsHeaderComponent } from './center-pricings-header.component';

describe('CenterPricingsHeaderComponent', () => {
  let component: CenterPricingsHeaderComponent;
  let fixture: ComponentFixture<CenterPricingsHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterPricingsHeaderComponent]
    });
    fixture = TestBed.createComponent(CenterPricingsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
