import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerRouteComponent } from './partner-route.component';

describe('PartnerRouteComponent', () => {
  let component: PartnerRouteComponent;
  let fixture: ComponentFixture<PartnerRouteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartnerRouteComponent]
    });
    fixture = TestBed.createComponent(PartnerRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
