import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryTagsComponent } from './category-tags.component';

describe('CategoryTagsComponent', () => {
  let component: CategoryTagsComponent;
  let fixture: ComponentFixture<CategoryTagsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryTagsComponent]
    });
    fixture = TestBed.createComponent(CategoryTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
