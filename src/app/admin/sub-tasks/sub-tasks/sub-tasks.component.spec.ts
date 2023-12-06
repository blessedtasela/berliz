import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubTasksComponent } from './sub-tasks.component';

describe('SubTasksComponent', () => {
  let component: SubTasksComponent;
  let fixture: ComponentFixture<SubTasksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubTasksComponent]
    });
    fixture = TestBed.createComponent(SubTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
