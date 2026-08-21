import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { HeroSectionComponent } from './hero-section.component';
import { DashboardService } from 'src/app/services/dashboard.service';

describe('HeroSectionComponent', () => {
  let component: HeroSectionComponent;
  let fixture: ComponentFixture<HeroSectionComponent>;

  beforeEach(() => {
    const dashboardServiceSpy = jasmine.createSpyObj('DashboardService', ['getBerlizDetails']);
    dashboardServiceSpy.getBerlizDetails.and.returnValue(of({ centers: 0, partners: 0, users: 0 }));

    TestBed.configureTestingModule({
      declarations: [HeroSectionComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(HeroSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
