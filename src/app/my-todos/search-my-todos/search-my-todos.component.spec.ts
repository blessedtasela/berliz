import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchMyTodosComponent } from './search-my-todos.component';

describe('SearchMyTodosComponent', () => {
  let component: SearchMyTodosComponent;
  let fixture: ComponentFixture<SearchMyTodosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchMyTodosComponent]
    });
    fixture = TestBed.createComponent(SearchMyTodosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
