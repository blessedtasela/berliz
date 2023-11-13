import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardActionComponent } from './dashboard-action.component';

describe('DashboardActionComponent', () => {
  let component: DashboardActionComponent;
  let fixture: ComponentFixture<DashboardActionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardActionComponent]
    });
    fixture = TestBed.createComponent(DashboardActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
