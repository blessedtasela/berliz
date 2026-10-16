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

  // Regression: the 9 MB background loop used to download for every visitor the moment the landing page opened.
  it('ships the background video without a source, so it is not fetched with the page', () => {
    const video: HTMLVideoElement = fixture.nativeElement.querySelector('video');
    expect(video.querySelector('source')).toBeNull();
    expect(video.hasAttribute('autoplay')).toBeFalse();
    expect(video.preload).toBe('none');
    expect(video.getAttribute('poster')).toContain('fire-fallback');
  });

  it('skips the video for data-saver and slow connections', () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'connection');
    const setConnection = (value: unknown) =>
      Object.defineProperty(navigator, 'connection', { value, configurable: true });
    try {
      setConnection({ saveData: true, effectiveType: '4g' });
      expect(component.shouldPlayBackgroundVideo()).toBeFalse();

      setConnection({ saveData: false, effectiveType: '3g' });
      expect(component.shouldPlayBackgroundVideo()).toBeFalse();
    } finally {
      if (original) Object.defineProperty(navigator, 'connection', original);
      else delete (navigator as any).connection;
    }
  });
});
