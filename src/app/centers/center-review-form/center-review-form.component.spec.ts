import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Subject } from 'rxjs';

import { SnackBarService } from 'src/app/services/snack-bar.service';
import { addCenterReview, addCenterReviewFailure, addCenterReviewSuccess } from 'src/app/state/center/center.actions';
import { selectUser } from 'src/app/state/user/user.selector';
import { CenterReviewFormComponent } from './center-review-form.component';

describe('CenterReviewFormComponent', () => {
  let component: CenterReviewFormComponent;
  let fixture: ComponentFixture<CenterReviewFormComponent>;
  let store: MockStore;
  let actions$: Subject<any>;
  let router: jasmine.SpyObj<Router>;

  function create(user: any, theme?: 'dark' | 'light') {
    actions$ = new Subject();
    router = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      imports: [CenterReviewFormComponent],
      providers: [
        provideMockStore({ selectors: [{ selector: selectUser, value: user }] }),
        { provide: Actions, useValue: actions$ },
        { provide: Router, useValue: router },
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) },
      ],
    });
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callThrough();
    fixture = TestBed.createComponent(CenterReviewFormComponent);
    component = fixture.componentInstance;
    component.centerId = 2;
    if (theme) component.theme = theme;
    fixture.detectChanges();
  }

  afterEach(() => store?.resetSelectors());

  const el = () => fixture.nativeElement as HTMLElement;

  it('asks a signed-out visitor to log in instead of showing the form', () => {
    create(null);
    expect(el().textContent).toContain('Log in to leave a review for this center.');
    expect(el().querySelector('form')).toBeNull();
    el().querySelector('button')!.click();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('wears the dark skin on the public page and the light skin in the dashboard', () => {
    create(null, 'dark');
    expect(el().querySelector('[data-testid="review-form"]')!.className).toContain('bg-zinc-900');

    TestBed.resetTestingModule();
    create(null, 'light');
    expect(el().querySelector('[data-testid="review-form"]')!.className).toContain('bg-white');
    expect(el().querySelector('[data-testid="review-form"]')!.className).not.toContain('bg-zinc-900');
  });

  it('shows the form to a signed-in user and sends the review with the center id', () => {
    create({ id: 1, role: 'user' }, 'light');
    expect(el().querySelector('form')).not.toBeNull();

    component.reviewForm.setValue({ rating: 4, comment: 'Great equipment and friendly staff.' });
    component.submit();
    expect(store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({ type: addCenterReview.type }));
    expect(component.submitting).toBeTrue();
  });

  it('does not send a review that is too short', () => {
    create({ id: 1, role: 'user' }, 'light');
    component.reviewForm.setValue({ rating: 5, comment: 'Nice' });
    component.submit();
    expect(store.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({ type: addCenterReview.type }));
  });

  it('says why when the server refuses (for example no completed session)', () => {
    create({ id: 1, role: 'user' }, 'light');
    component.reviewForm.setValue({ rating: 4, comment: 'Great equipment and friendly staff.' });
    component.submit();
    actions$.next(addCenterReviewFailure({ error: 'You can only review a center you have trained at.' }));
    fixture.detectChanges();
    expect(component.submitting).toBeFalse();
    expect(component.submitError).toBe('You can only review a center you have trained at.');
  });

  it('resets after a successful submit', () => {
    create({ id: 1, role: 'user' }, 'light');
    component.reviewForm.setValue({ rating: 4, comment: 'Great equipment and friendly staff.' });
    component.submit();
    actions$.next(addCenterReviewSuccess({ response: {} as any }));
    expect(component.submitting).toBeFalse();
    expect(component.reviewForm.value.comment).toBeFalsy();
  });
});
