import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Actions } from '@ngrx/effects';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Subject } from 'rxjs';

import { FaqsComponent } from './faqs.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { selectFaqs } from 'src/app/state/faq/faq.selectors';
import { loadFaqs, loadFaqsFailure, loadFaqsSuccess } from 'src/app/state/faq/faq.actions';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';

describe('FaqsComponent', () => {
  let component: FaqsComponent;
  let fixture: ComponentFixture<FaqsComponent>;
  let actions$: Subject<any>;

  beforeEach(() => {
    actions$ = new Subject<any>();
    const mockNgxService = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [FaqsComponent],
      imports: [LoadErrorComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Actions, useValue: actions$ },
        provideMockStore({
          selectors: [{ selector: selectFaqs, value: [] }]
        }),
        { provide: NgxUiLoaderService, useValue: mockNgxService },
        { provide: MatDialog, useValue: mockDialog },
      ]
    });

    fixture = TestBed.createComponent(FaqsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the FAQs cannot be loaded', () => {
    const el = () => fixture.nativeElement as HTMLElement;

    it('shows a retryable error instead of an empty list', () => {
      actions$.next(loadFaqsFailure({ error: 'Server exploded' }));
      fixture.detectChanges();

      expect(el().textContent).toContain("Couldn't load FAQs");
      expect(el().textContent).toContain('Server exploded');
      expect(el().querySelector('app-faqs-list')).toBeNull();
    });

    it('retrying loads them again, and a success brings the list back', () => {
      actions$.next(loadFaqsFailure({ error: 'Server exploded' }));
      fixture.detectChanges();
      const dispatch = spyOn(TestBed.inject(MockStore), 'dispatch');

      (el().querySelector('app-load-error button') as HTMLButtonElement).click();
      expect(dispatch).toHaveBeenCalledWith(loadFaqs());

      actions$.next(loadFaqsSuccess({} as any));
      fixture.detectChanges();
      expect(el().querySelector('app-load-error')).toBeNull();
      expect(el().querySelector('app-faqs-list')).not.toBeNull();
    });

    it('shows the list (not an error) when nothing failed', () => {
      expect(el().querySelector('app-load-error')).toBeNull();
      expect(el().querySelector('app-faqs-list')).not.toBeNull();
    });
  });
});
