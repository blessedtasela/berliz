import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Actions } from '@ngrx/effects';
import { Subject } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { CenterPageComponent } from './center-page.component';
import { loadActiveCenters, loadActiveCentersFailure, loadActiveCentersSuccess } from 'src/app/state/center/center.actions';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';

describe('CenterPageComponent', () => {
  let component: CenterPageComponent;
  let fixture: ComponentFixture<CenterPageComponent>;
  let actions$: Subject<any>;

  beforeEach(() => {
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);

    actions$ = new Subject<any>();
    TestBed.configureTestingModule({
      declarations: [CenterPageComponent],
      imports: [LoadErrorComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: Actions, useValue: actions$ },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(CenterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the centers cannot be loaded', () => {
    const el = () => fixture.nativeElement as HTMLElement;

    it('shows a retryable error instead of an empty results list', () => {
      actions$.next(loadActiveCentersFailure({ error: 'Server exploded' }));
      fixture.detectChanges();

      expect(el().textContent).toContain("Couldn't load centers");
      expect(el().textContent).toContain('Server exploded');
      expect(el().querySelector('app-center-search-result')).toBeNull();
    });

    it('retrying loads them again, and a success brings the results back', () => {
      actions$.next(loadActiveCentersFailure({ error: 'Server exploded' }));
      fixture.detectChanges();
      const dispatch = spyOn(TestBed.inject(MockStore), 'dispatch');

      (el().querySelector('app-load-error button') as HTMLButtonElement).click();
      expect(dispatch).toHaveBeenCalledWith(loadActiveCenters());

      actions$.next(loadActiveCentersSuccess({ response: [] } as any));
      fixture.detectChanges();
      expect(el().querySelector('app-load-error')).toBeNull();
      expect(el().querySelector('app-center-search-result')).not.toBeNull();
    });
  });
});
