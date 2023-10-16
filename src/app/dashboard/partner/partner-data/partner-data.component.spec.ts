import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerDataComponent } from './partner-data.component';

describe('PartnerDataComponent', () => {
  let component: PartnerDataComponent;
  let fixture: ComponentFixture<PartnerDataComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartnerDataComponent]
    });
    fixture = TestBed.createComponent(PartnerDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
