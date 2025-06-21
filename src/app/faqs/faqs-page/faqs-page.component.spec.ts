import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqsPageComponent } from './faqs-page.component';

describe('FaqsPageComponent', () => {
  let component: FaqsPageComponent;
  let fixture: ComponentFixture<FaqsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FaqsPageComponent]
    });
    fixture = TestBed.createComponent(FaqsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
