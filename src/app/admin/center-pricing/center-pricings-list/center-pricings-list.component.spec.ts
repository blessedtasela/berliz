import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterPricingsListComponent } from './center-pricings-list.component';

describe('CenterPricingsListComponent', () => {
  let component: CenterPricingsListComponent;
  let fixture: ComponentFixture<CenterPricingsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterPricingsListComponent]
    });
    fixture = TestBed.createComponent(CenterPricingsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
