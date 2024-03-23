import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTodosFormComponent } from './my-todos-form.component';

describe('MyTodosFormComponent', () => {
  let component: MyTodosFormComponent;
  let fixture: ComponentFixture<MyTodosFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTodosFormComponent]
    });
    fixture = TestBed.createComponent(MyTodosFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
