import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryVoteComponent } from './category-vote.component';

describe('CategoryVoteComponent', () => {
  let component: CategoryVoteComponent;
  let fixture: ComponentFixture<CategoryVoteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryVoteComponent]
    });
    fixture = TestBed.createComponent(CategoryVoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
