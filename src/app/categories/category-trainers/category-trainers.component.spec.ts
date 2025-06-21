import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryTrainersComponent } from './category-trainers.component';

describe('CategoryTrainersComponent', () => {
  let component: CategoryTrainersComponent;
  let fixture: ComponentFixture<CategoryTrainersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryTrainersComponent]
    });
    fixture = TestBed.createComponent(CategoryTrainersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
