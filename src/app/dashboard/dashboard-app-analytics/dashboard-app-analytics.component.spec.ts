import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { DashboardAppAnalyticsComponent } from './dashboard-app-analytics.component';

describe('DashboardAppAnalyticsComponent', () => {
  let component: DashboardAppAnalyticsComponent;
  let fixture: ComponentFixture<DashboardAppAnalyticsComponent>;

  beforeEach(() => {
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);

    TestBed.configureTestingModule({
      declarations: [DashboardAppAnalyticsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(DashboardAppAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
