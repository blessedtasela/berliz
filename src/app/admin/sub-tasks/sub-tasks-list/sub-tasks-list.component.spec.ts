import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubTasksListComponent } from './sub-tasks-list.component';

describe('SubTasksListComponent', () => {
  let component: SubTasksListComponent;
  let fixture: ComponentFixture<SubTasksListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubTasksListComponent]
    });
    fixture = TestBed.createComponent(SubTasksListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
