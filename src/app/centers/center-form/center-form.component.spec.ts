import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { CenterFormComponent } from './center-form.component';

describe('CenterFormComponent', () => {
  let component: CenterFormComponent;
  let fixture: ComponentFixture<CenterFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterFormComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [FormBuilder]
    });
    fixture = TestBed.createComponent(CenterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
