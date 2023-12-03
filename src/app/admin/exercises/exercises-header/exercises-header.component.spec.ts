import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExercisesHeaderComponent } from './exercises-header.component';

describe('ExercisesHeaderComponent', () => {
  let component: ExercisesHeaderComponent;
  let fixture: ComponentFixture<ExercisesHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExercisesHeaderComponent]
    });
    fixture = TestBed.createComponent(ExercisesHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
