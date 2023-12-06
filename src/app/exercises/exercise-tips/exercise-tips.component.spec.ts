import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseTipsComponent } from './exercise-tips.component';

describe('ExerciseTipsComponent', () => {
  let component: ExerciseTipsComponent;
  let fixture: ComponentFixture<ExerciseTipsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExerciseTipsComponent]
    });
    fixture = TestBed.createComponent(ExerciseTipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
