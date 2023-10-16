import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterPartnerFormComponent } from './center-partner-form.component';

describe('CenterPartnerFormComponent', () => {
  let component: CenterPartnerFormComponent;
  let fixture: ComponentFixture<CenterPartnerFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterPartnerFormComponent]
    });
    fixture = TestBed.createComponent(CenterPartnerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
