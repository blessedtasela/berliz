import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalMainComponent } from './legal-main.component';

describe('LegalMainComponent', () => {
  let component: LegalMainComponent;
  let fixture: ComponentFixture<LegalMainComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LegalMainComponent]
    });
    fixture = TestBed.createComponent(LegalMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
