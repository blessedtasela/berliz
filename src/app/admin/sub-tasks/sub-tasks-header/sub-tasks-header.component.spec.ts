import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubTasksHeaderComponent } from './sub-tasks-header.component';

describe('SubTasksHeaderComponent', () => {
  let component: SubTasksHeaderComponent;
  let fixture: ComponentFixture<SubTasksHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubTasksHeaderComponent]
    });
    fixture = TestBed.createComponent(SubTasksHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
