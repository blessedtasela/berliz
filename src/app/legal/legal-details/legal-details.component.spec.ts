import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalDetailsComponent } from './legal-details.component';

describe('LegalDetailsComponent', () => {
  let component: LegalDetailsComponent;
  let fixture: ComponentFixture<LegalDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LegalDetailsComponent]
    });
    fixture = TestBed.createComponent(LegalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
