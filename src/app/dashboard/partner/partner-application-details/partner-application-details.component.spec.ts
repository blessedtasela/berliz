import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerApplicationDetailsComponent } from './partner-application-details.component';

describe('PartnerApplicationDetailsComponent', () => {
  let component: PartnerApplicationDetailsComponent;
  let fixture: ComponentFixture<PartnerApplicationDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartnerApplicationDetailsComponent]
    });
    fixture = TestBed.createComponent(PartnerApplicationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
