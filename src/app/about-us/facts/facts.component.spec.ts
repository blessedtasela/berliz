import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { FactsComponent } from './facts.component';
import { DashboardService } from 'src/app/services/dashboard.service';

describe('FactsComponent', () => {
  let component: FactsComponent;
  let fixture: ComponentFixture<FactsComponent>;

  beforeEach(() => {
    const dashboardServiceSpy = jasmine.createSpyObj('DashboardService', ['getBerlizDetails']);
    dashboardServiceSpy.getBerlizDetails.and.returnValue(of({ centers: 0, partners: 0, users: 0, categories: 0 }));

    TestBed.configureTestingModule({
      declarations: [FactsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(FactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
