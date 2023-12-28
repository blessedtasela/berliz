import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceRouteComponent } from './workspace-route.component';

describe('WorkspaceRouteComponent', () => {
  let component: WorkspaceRouteComponent;
  let fixture: ComponentFixture<WorkspaceRouteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkspaceRouteComponent]
    });
    fixture = TestBed.createComponent(WorkspaceRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
