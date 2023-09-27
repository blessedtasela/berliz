import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryIntroductionComponent } from './category-introduction.component';

describe('CategoryIntroductionComponent', () => {
  let component: CategoryIntroductionComponent;
  let fixture: ComponentFixture<CategoryIntroductionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryIntroductionComponent]
    });
    fixture = TestBed.createComponent(CategoryIntroductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
