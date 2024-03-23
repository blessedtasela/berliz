import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerNullComponent } from './partner-null.component';

describe('PartnerNullComponent', () => {
  let component: PartnerNullComponent;
  let fixture: ComponentFixture<PartnerNullComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartnerNullComponent]
    });
    fixture = TestBed.createComponent(PartnerNullComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
