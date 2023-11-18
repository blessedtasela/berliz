import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchMyTodoComponent } from './search-my-todo.component';

describe('SearchMyTodoComponent', () => {
  let component: SearchMyTodoComponent;
  let fixture: ComponentFixture<SearchMyTodoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchMyTodoComponent]
    });
    fixture = TestBed.createComponent(SearchMyTodoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
