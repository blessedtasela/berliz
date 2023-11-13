import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NullPartnerComponent } from './null-partner.component';

describe('NullPartnerComponent', () => {
  let component: NullPartnerComponent;
  let fixture: ComponentFixture<NullPartnerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NullPartnerComponent]
    });
    fixture = TestBed.createComponent(NullPartnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
