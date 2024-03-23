import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTodosComponent } from './my-todos.component';

describe('MyTodosComponent', () => {
  let component: MyTodosComponent;
  let fixture: ComponentFixture<MyTodosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTodosComponent]
    });
    fixture = TestBed.createComponent(MyTodosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
