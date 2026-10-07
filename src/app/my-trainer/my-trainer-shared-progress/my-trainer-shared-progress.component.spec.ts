import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Actions } from '@ngrx/effects';
import { Subject } from 'rxjs';

import { MyTrainerSharedProgressComponent } from './my-trainer-shared-progress.component';
import { ProgressShare, ClientProgress } from 'src/app/models/progress-share.model';
import {
  selectLoadingClientProgress,
  selectProgressShareLoading,
  selectSelectedClientProgress,
  selectSharedWithMe,
} from 'src/app/state/progress-share/progress-share.selectors';
import { loadClientProgress, clearSelectedClientProgress, loadSharedWithMe, loadSharedWithMeFailure, loadSharedWithMeSuccess } from 'src/app/state/progress-share/progress-share.actions';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';

describe('MyTrainerSharedProgressComponent', () => {
  let component: MyTrainerSharedProgressComponent;
  let fixture: ComponentFixture<MyTrainerSharedProgressComponent>;
  let store: MockStore;
  let actions$: Subject<any>;

  const sharedClients: ProgressShare[] = [
    {
      id: 1, clientId: 42, clientFirstname: 'Jane', clientLastname: 'Doe', clientEmail: 'jane@doe.com',
      trainerId: 7, trainerName: 'Coach', grantedAt: new Date(), revokedAt: null, isActive: true,
      date: new Date(), lastUpdate: new Date(),
    }
  ];

  const progress: ClientProgress = {
    clientId: 42, clientFirstname: 'Jane', clientLastname: 'Doe', clientEmail: 'jane@doe.com',
    assignments: [], progressEntries: []
  };

  beforeEach(() => {
    actions$ = new Subject<any>();
    TestBed.configureTestingModule({
      declarations: [MyTrainerSharedProgressComponent],
      imports: [LoadErrorComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Actions, useValue: actions$ },
        provideMockStore({
          selectors: [
            { selector: selectSharedWithMe, value: sharedClients },
            { selector: selectProgressShareLoading, value: false },
            { selector: selectSelectedClientProgress, value: null },
            { selector: selectLoadingClientProgress, value: false },
          ]
        }),
      ]
    });

    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callThrough();

    fixture = TestBed.createComponent(MyTrainerSharedProgressComponent);
    component = fixture.componentInstance;
  });

  it('loads the shared-with-me list from the store on init', () => {
    fixture.detectChanges();

    expect(component.sharedClients).toEqual(sharedClients);
  });

  it('viewProgress sets the selected client and dispatches loadClientProgress for that client', () => {
    fixture.detectChanges();

    component.viewProgress(sharedClients[0]);

    expect(component.selectedClientId).toBe(42);
    expect(store.dispatch).toHaveBeenCalledWith(loadClientProgress({ clientId: 42 }));
  });

  it('closeProgress clears the selected client and dispatches clearSelectedClientProgress', () => {
    fixture.detectChanges();
    component.selectedClientId = 42;
    (store.dispatch as jasmine.Spy).calls.reset();

    component.closeProgress();

    expect(component.selectedClientId).toBeNull();
    expect(store.dispatch).toHaveBeenCalledWith(clearSelectedClientProgress());
  });

  it('reflects selectSelectedClientProgress into selectedProgress', () => {
    store.overrideSelector(selectSelectedClientProgress, progress);
    store.refreshState();
    fixture.detectChanges();

    expect(component.selectedProgress).toEqual(progress);
  });

  it('dispatches clearSelectedClientProgress on destroy', () => {
    fixture.detectChanges();
    (store.dispatch as jasmine.Spy).calls.reset();

    component.ngOnDestroy();

    expect(store.dispatch).toHaveBeenCalledWith(clearSelectedClientProgress());
  });

  describe('when the shared-client list cannot be loaded', () => {
    const el = () => fixture.nativeElement as HTMLElement;

    beforeEach(() => {
      store.overrideSelector(selectSharedWithMe, []);
      store.refreshState();
      fixture.detectChanges();
    });

    it('shows a retryable error instead of "no clients have shared"', () => {
      actions$.next(loadSharedWithMeFailure({ error: 'Server exploded' }));
      fixture.detectChanges();

      expect(el().textContent).toContain("Couldn't load your clients' progress");
      expect(el().textContent).toContain('Server exploded');
      expect(el().textContent).not.toContain('No clients have shared their progress with you yet');
    });

    it('retrying loads the list again, and a success clears the error', () => {
      actions$.next(loadSharedWithMeFailure({ error: 'Server exploded' }));
      fixture.detectChanges();

      (el().querySelector('app-load-error button') as HTMLButtonElement).click();
      expect(store.dispatch).toHaveBeenCalledWith(loadSharedWithMe());

      actions$.next(loadSharedWithMeSuccess({ response: [] } as any));
      fixture.detectChanges();
      expect(el().querySelector('app-load-error')).toBeNull();
      expect(el().textContent).toContain('No clients have shared their progress with you yet');
    });
  });
});
