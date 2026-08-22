import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';

import { SearchExerciseComponent } from './search-exercise.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('SearchExerciseComponent', () => {
  let component: SearchExerciseComponent;
  let fixture: ComponentFixture<SearchExerciseComponent>;

  beforeEach(() => {
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [SearchExerciseComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: SnackBarService, useValue: snackbarSpy }
      ]
    });
    fixture = TestBed.createComponent(SearchExerciseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
