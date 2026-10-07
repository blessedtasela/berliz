import { Subject } from 'rxjs';
import { Actions } from '@ngrx/effects';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { loadNewsletters, loadNewslettersFailure, loadNewslettersSuccess } from 'src/app/state/newsletter/newsletter.actions';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
import { NewslettersComponent } from './newsletters.component';

describe('NewslettersComponent', () => {
  let component: NewslettersComponent;
  let fixture: ComponentFixture<NewslettersComponent>;
  let actions$: Subject<any>;

  beforeEach(() => {
    actions$ = new Subject<any>();
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [NewslettersComponent],
      imports: [LoadErrorComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Actions, useValue: actions$ },
        provideMockStore(),
        { provide: MatDialog, useValue: dialogSpy }
      ]
    });
    fixture = TestBed.createComponent(NewslettersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the newsletters cannot be loaded', () => {
    const el = () => fixture.nativeElement as HTMLElement;

    it('shows a retryable error instead of an empty table', () => {
      actions$.next(loadNewslettersFailure({ error: 'Server exploded' }));
      fixture.detectChanges();

      expect(el().textContent).toContain("Couldn't load newsletters");
      expect(el().textContent).toContain('Server exploded');
      expect(/<app-[a-z-]+-(header|list)\b/.test(el().innerHTML)).toBeFalse();
    });

    it('retrying loads them again, and a success brings the table back', () => {
      actions$.next(loadNewslettersFailure({ error: 'Server exploded' }));
      fixture.detectChanges();
      const dispatch = spyOn(TestBed.inject(MockStore), 'dispatch');

      (el().querySelector('app-load-error button') as HTMLButtonElement).click();
      expect(dispatch).toHaveBeenCalledWith(loadNewsletters());

      actions$.next(loadNewslettersSuccess({ response: [] } as any));
      fixture.detectChanges();
      expect(el().querySelector('app-load-error')).toBeNull();
      expect(/<app-[a-z-]+-header\b/.test(el().innerHTML)).toBeTrue();
    });

    it('shows the table (not an error) when nothing failed', () => {
      expect(el().querySelector('app-load-error')).toBeNull();
      expect(/<app-[a-z-]+-header\b/.test(el().innerHTML)).toBeTrue();
    });
  });
});
