import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';

import { ExercisesSectionComponent } from './exercises-section.component';

describe('ExercisesSectionComponent', () => {
  let component: ExercisesSectionComponent;
  let fixture: ComponentFixture<ExercisesSectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExercisesSectionComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
      ]
    });

    fixture = TestBed.createComponent(ExercisesSectionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
