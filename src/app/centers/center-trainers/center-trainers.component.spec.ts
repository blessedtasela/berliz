import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CenterTrainersComponent } from './center-trainers.component';

describe('CenterTrainersComponent', () => {
  let component: CenterTrainersComponent;
  let fixture: ComponentFixture<CenterTrainersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterTrainersComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(CenterTrainersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
