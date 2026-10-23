import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { MutationRefreshInterceptor } from './mutation-refresh.interceptor';
import { loadActiveTrainers, loadTrainers } from 'src/app/state/trainer/trainer.actions';

describe('MutationRefreshInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let store: MockStore;
  let role: string | null;

  beforeEach(() => {
    role = 'admin';
    TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        { provide: AuthService, useValue: { getCurrentUserRole: () => role } },
        { provide: HTTP_INTERCEPTORS, useClass: MutationRefreshInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
  });

  afterEach(() => controller.verify());

  const url = (path: string) => environment.api + path;

  it('re-fetches the trainer lists after an admin changes a trainer', fakeAsync(() => {
    http.put(url('/trainer/updateTrainerStatus/5'), null).subscribe();
    controller.expectOne(url('/trainer/updateTrainerStatus/5')).flush({ success: true, message: 'ok', data: {} });

    tick(200);

    const dispatched = (store.dispatch as jasmine.Spy).calls.allArgs().map(a => a[0].type);
    expect(dispatched).toContain(loadTrainers().type);
    expect(dispatched).toContain(loadActiveTrainers().type);
  }));

  it('does nothing when the API answers 200 with success:false', fakeAsync(() => {
    http.put(url('/trainer/updateTrainerStatus/5'), null).subscribe();
    controller.expectOne(url('/trainer/updateTrainerStatus/5')).flush({ success: false, message: 'Not allowed' });

    tick(200);

    expect(store.dispatch).not.toHaveBeenCalled();
  }));

  it('does nothing when the request fails', fakeAsync(() => {
    http.put(url('/trainer/updateTrainerStatus/5'), null).subscribe({ error: () => undefined });
    controller.expectOne(url('/trainer/updateTrainerStatus/5')).flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });

    tick(200);

    expect(store.dispatch).not.toHaveBeenCalled();
  }));

  it('ignores reads and requests to other hosts', fakeAsync(() => {
    http.get(url('/trainer/getTrainers')).subscribe();
    controller.expectOne(url('/trainer/getTrainers')).flush({ success: true, data: [] });
    http.put('https://cms.example.com/trainer/updateTrainerStatus/5', null).subscribe();
    controller.expectOne('https://cms.example.com/trainer/updateTrainerStatus/5').flush({ success: true });

    tick(200);

    expect(store.dispatch).not.toHaveBeenCalled();
  }));

  it('refreshes once for a burst of changes', fakeAsync(() => {
    for (const id of [1, 2, 3]) {
      http.put(url(`/trainer/updateTrainerStatus/${id}`), null).subscribe();
      controller.expectOne(url(`/trainer/updateTrainerStatus/${id}`)).flush({ success: true, data: {} });
    }

    tick(200);

    const loadTrainersCalls = (store.dispatch as jasmine.Spy).calls.allArgs().filter(a => a[0].type === loadTrainers().type);
    expect(loadTrainersCalls.length).toBe(1);
  }));

  it('only asks for what the caller\'s role may load', fakeAsync(() => {
    role = 'client';
    http.put(url('/trainer/updateTrainerStatus/5'), null).subscribe();
    controller.expectOne(url('/trainer/updateTrainerStatus/5')).flush({ success: true, data: {} });

    tick(200);

    const dispatched = (store.dispatch as jasmine.Spy).calls.allArgs().map(a => a[0].type);
    expect(dispatched).toEqual([loadActiveTrainers().type]);
  }));
});
