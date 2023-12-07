import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTopUsersComponent } from './dashboard-top-users.component';

describe('DashboardTopUsersComponent', () => {
  let component: DashboardTopUsersComponent;
  let fixture: ComponentFixture<DashboardTopUsersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardTopUsersComponent]
    });
    fixture = TestBed.createComponent(DashboardTopUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
