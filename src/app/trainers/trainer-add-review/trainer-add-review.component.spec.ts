import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Subject } from 'rxjs';

import { SnackBarService } from 'src/app/services/snack-bar.service';
import { addTrainerReview, addTrainerReviewFailure } from 'src/app/state/trainer/trainer.actions';
import { selectUser } from 'src/app/state/user/user.selector';
import { TrainerAddReviewComponent } from './trainer-add-review.component';

describe('TrainerAddReviewComponent', () => {
  let component: TrainerAddReviewComponent;
  let fixture: ComponentFixture<TrainerAddReviewComponent>;
  let store: MockStore;
  let actions$: Subject<any>;
  let router: jasmine.SpyObj<Router>;

  function create(user: any, theme?: 'dark' | 'light') {
    actions$ = new Subject();
    router = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      imports: [TrainerAddReviewComponent],
      providers: [
        provideMockStore({ selectors: [{ selector: selectUser, value: user }] }),
        { provide: Actions, useValue: actions$ },
        { provide: Router, useValue: router },
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) },
      ],
    });
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callThrough();
    fixture = TestBed.createComponent(TrainerAddReviewComponent);
    component = fixture.componentInstance;
    component.trainerId = 1;
    if (theme) component.theme = theme;
    fixture.detectChanges();
  }

  afterEach(() => store?.resetSelectors());

  const el = () => fixture.nativeElement as HTMLElement;

  it('asks a signed-out visitor to log in instead of showing the form', () => {
    create(null);
    expect(el().textContent).toContain('Log in to leave a review for this trainer.');
    expect(el().querySelector('form')).toBeNull();
    el().querySelector('button')!.click();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('wears the dark skin on the public page by default and the light skin in the dashboard', () => {
    create(null);
    expect(el().querySelector('[data-testid="review-form"]')!.className).toContain('bg-zinc-900');

    TestBed.resetTestingModule();
    create(null, 'light');
    expect(el().querySelector('[data-testid="review-form"]')!.className).toContain('bg-white');
    expect(el().querySelector('[data-testid="review-form"]')!.className).not.toContain('bg-zinc-900');
  });

  it('shows the form to a signed-in user and sends the review with the trainer id', () => {
    create({ id: 1, role: 'user' }, 'light');
    expect(el().querySelector('form')).not.toBeNull();

    component.reviewForm.setValue({ rating: 5, review: 'Brilliant coaching, worth every session.' });
    component.submit();
    expect(store.dispatch).toHaveBeenCalledWith(addTrainerReview({ data: { trainerId: 1, review: 'Brilliant coaching, worth every session.', rating: 5 } } as any));
  });

  it('does not send a review that is too short or has no rating', () => {
    create({ id: 1, role: 'user' }, 'light');
    component.reviewForm.setValue({ rating: null, review: 'Nice' });
    component.submit();
    expect(store.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({ type: addTrainerReview.type }));
  });

  it('says why when the server refuses (for example no completed session)', () => {
    create({ id: 1, role: 'user' }, 'light');
    component.reviewForm.setValue({ rating: 4, review: 'Brilliant coaching, worth every session.' });
    component.submit();
    actions$.next(addTrainerReviewFailure({ error: 'You can only review a trainer you have completed a session with.' }));
    expect(component.submitError).toBe('You can only review a trainer you have completed a session with.');
    expect(component.submitting).toBeFalse();
  });
});
