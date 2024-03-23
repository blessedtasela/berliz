import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainersCategoriesComponent } from './trainers-categories.component';

describe('TrainersCategoriesComponent', () => {
  let component: TrainersCategoriesComponent;
  let fixture: ComponentFixture<TrainersCategoriesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainersCategoriesComponent]
    });
    fixture = TestBed.createComponent(TrainersCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
