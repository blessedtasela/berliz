import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMyTodosComponent } from './edit-my-todos.component';

describe('EditMyTodosComponent', () => {
  let component: EditMyTodosComponent;
  let fixture: ComponentFixture<EditMyTodosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditMyTodosComponent]
    });
    fixture = TestBed.createComponent(EditMyTodosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
