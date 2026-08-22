import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MyTasksPageComponent } from './my-tasks-page.component';

describe('MyTasksPageComponent', () => {
  let component: MyTasksPageComponent;
  let fixture: ComponentFixture<MyTasksPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTasksPageComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(MyTasksPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
