import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { EMPTY, Observable } from 'rxjs';

import { NotificationEffects } from './notification.effects';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('NotificationEffects', () => {
  let actions$: Observable<any> = EMPTY;
  let effects: NotificationEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        NotificationEffects,
        provideMockActions(() => actions$),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});

    effects = TestBed.inject(NotificationEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
