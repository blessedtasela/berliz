import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NEVER, of } from 'rxjs';
import { AppComponent } from './app.component';
import { BlurService } from './services/blur.service';
import { SidebarStateService } from './services/sidebar-state.service';
import { NewsletterTriggerService } from './shared/newsletter-popup/newsletter-trigger.service';
import { InactivityService } from './services/inactivity.service';
import { SeoService } from './services/seo.service';

describe('AppComponent', () => {
  beforeEach(() => {
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open'], {
      afterOpened: NEVER,
      afterAllClosed: NEVER
    });
    const sidebarStateSpy = jasmine.createSpyObj('SidebarStateService', [], {
      mode$: of('expanded')
    });
    const inactivityServiceSpy = jasmine.createSpyObj('InactivityService', ['start']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: BlurService, useValue: {} },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: SidebarStateService, useValue: sidebarStateSpy },
        { provide: NewsletterTriggerService, useValue: {} },
        { provide: InactivityService, useValue: inactivityServiceSpy },
        { provide: SeoService, useValue: {} }
      ]
    });
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Berliz'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Berliz');
  });
});
