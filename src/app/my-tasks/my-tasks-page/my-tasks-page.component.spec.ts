import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTasksPageComponent } from './my-tasks-page.component';

describe('MyTasksPageComponent', () => {
  let component: MyTasksPageComponent;
  let fixture: ComponentFixture<MyTasksPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTasksPageComponent]
    });
    fixture = TestBed.createComponent(MyTasksPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
