import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTodosListComponent } from './my-todos-list.component';

describe('MyTodosListComponent', () => {
  let component: MyTodosListComponent;
  let fixture: ComponentFixture<MyTodosListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTodosListComponent]
    });
    fixture = TestBed.createComponent(MyTodosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
