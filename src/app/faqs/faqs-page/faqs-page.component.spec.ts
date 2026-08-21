import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';

import { FaqsPageComponent } from './faqs-page.component';

describe('FaqsPageComponent', () => {
  let component: FaqsPageComponent;
  let fixture: ComponentFixture<FaqsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FaqsPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore()
      ]
    });
    fixture = TestBed.createComponent(FaqsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
