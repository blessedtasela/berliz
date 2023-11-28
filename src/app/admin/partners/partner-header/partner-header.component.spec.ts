import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerHeaderComponent } from './partner-header.component';

describe('PartnerHeaderComponent', () => {
  let component: PartnerHeaderComponent;
  let fixture: ComponentFixture<PartnerHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartnerHeaderComponent]
    });
    fixture = TestBed.createComponent(PartnerHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
