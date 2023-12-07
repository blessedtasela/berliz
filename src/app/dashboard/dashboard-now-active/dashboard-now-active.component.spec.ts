import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardNowActiveComponent } from './dashboard-now-active.component';

describe('DashboardNowActiveComponent', () => {
  let component: DashboardNowActiveComponent;
  let fixture: ComponentFixture<DashboardNowActiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardNowActiveComponent]
    });
    fixture = TestBed.createComponent(DashboardNowActiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
