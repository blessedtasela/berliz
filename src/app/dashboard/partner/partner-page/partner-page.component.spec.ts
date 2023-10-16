import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerPageComponent } from './partner-page.component';

describe('PartnerPageComponent', () => {
  let component: PartnerPageComponent;
  let fixture: ComponentFixture<PartnerPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartnerPageComponent]
    });
    fixture = TestBed.createComponent(PartnerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
