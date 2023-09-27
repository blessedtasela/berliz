import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerCategoryComponent } from './trainer-category.component';

describe('TrainerCategoryComponent', () => {
  let component: TrainerCategoryComponent;
  let fixture: ComponentFixture<TrainerCategoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerCategoryComponent]
    });
    fixture = TestBed.createComponent(TrainerCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
