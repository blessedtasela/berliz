import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryHeroDetailsComponent } from './category-hero-details.component';

describe('CategoryHeroDetailsComponent', () => {
  let component: CategoryHeroDetailsComponent;
  let fixture: ComponentFixture<CategoryHeroDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryHeroDetailsComponent]
    });
    fixture = TestBed.createComponent(CategoryHeroDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
