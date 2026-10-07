import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Actions } from '@ngrx/effects';
import { Subject } from 'rxjs';

import { MyClientIntakesComponent } from './my-client-intakes.component';
import { selectMyClientIntakes } from 'src/app/state/client-intake/client-intake.selectors';
import { loadMyClientIntakes, loadMyClientIntakesFailure, loadMyClientIntakesSuccess } from 'src/app/state/client-intake/client-intake.actions';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';

describe('MyClientIntakesComponent', () => {
  let component: MyClientIntakesComponent;
  let fixture: ComponentFixture<MyClientIntakesComponent>;
  let actions$: Subject<any>;

  beforeEach(() => {
    actions$ = new Subject<any>();
    TestBed.configureTestingModule({
      declarations: [MyClientIntakesComponent],
      imports: [LoadErrorComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Actions, useValue: actions$ },
        provideMockStore({ selectors: [{ selector: selectMyClientIntakes, value: [] }] }),
      ]
    });

    fixture = TestBed.createComponent(MyClientIntakesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('when the intakes cannot be loaded', () => {
    const el = () => fixture.nativeElement as HTMLElement;

    beforeEach(() => fixture.detectChanges());

    it("shows a retryable error instead of \"you haven't started any\"", () => {
      actions$.next(loadMyClientIntakesFailure({ error: 'Server exploded' }));
      fixture.detectChanges();

      expect(el().textContent).toContain("Couldn't load your client intakes");
      expect(el().textContent).toContain('Server exploded');
      expect(el().textContent).not.toContain("You haven't started any client intakes yet");
    });

    it('retrying reloads, and a success clears the error', () => {
      actions$.next(loadMyClientIntakesFailure({ error: 'Server exploded' }));
      fixture.detectChanges();
      const dispatch = spyOn(TestBed.inject(MockStore), 'dispatch');

      (el().querySelector('app-load-error button') as HTMLButtonElement).click();
      expect(dispatch).toHaveBeenCalledWith(loadMyClientIntakes());

      actions$.next(loadMyClientIntakesSuccess({ response: [] } as any));
      fixture.detectChanges();
      expect(el().querySelector('app-load-error')).toBeNull();
    });

    it('shows the genuine empty state when nothing failed', () => {
      expect(el().textContent).toContain("You haven't started any client intakes yet");
    });
  });
});
