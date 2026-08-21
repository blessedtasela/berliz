import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SubFooterComponent } from './sub-footer.component';

describe('SubFooterComponent', () => {
  let component: SubFooterComponent;
  let fixture: ComponentFixture<SubFooterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubFooterComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(SubFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
