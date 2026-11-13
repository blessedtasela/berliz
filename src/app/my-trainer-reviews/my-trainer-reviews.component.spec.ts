import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { MyTrainerReviewsComponent } from './my-trainer-reviews.component';
import { ApiResponse } from 'src/app/models/Api.interface';
import { ClientService } from 'src/app/services/client.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerReview } from 'src/app/models/trainers.interface';

describe('MyTrainerReviewsComponent', () => {
  let component: MyTrainerReviewsComponent;
  let fixture: ComponentFixture<MyTrainerReviewsComponent>;
  let clientService: jasmine.SpyObj<ClientService>;
  let snackbar: jasmine.SpyObj<SnackBarService>;

  const review = (over: Partial<TrainerReview> = {}): TrainerReview => ({
    id: 1,
    trainerId: 5,
    trainerName: 'Coach Sam',
    clientId: 10,
    clientName: 'Jane Doe',
    review: 'Great trainer, highly recommend.',
    rating: 5,
    likes: 2,
    status: 'true',
    photoFrontBefore: null as any,
    photoFrontAfter: null as any,
    photoSideBefore: null as any,
    photoSideAfter: null as any,
    photoBackBefore: null as any,
    photoBackAfter: null as any,
    date: new Date('2026-01-01'),
    lastUpdate: new Date('2026-01-01'),
    ...over,
  });

  function setup(response$: Observable<ApiResponse<TrainerReview[]>>) {
    clientService = jasmine.createSpyObj('ClientService', ['getMyTrainerReviews']);
    clientService.getMyTrainerReviews.and.returnValue(response$);
    snackbar = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      imports: [MyTrainerReviewsComponent],
      providers: [
        provideRouter([]),
        { provide: ClientService, useValue: clientService },
        { provide: SnackBarService, useValue: snackbar },
      ],
    });

    fixture = TestBed.createComponent(MyTrainerReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('loads and shows the reviews the client has written', () => {
    setup(of({ message: '', success: true, statusCode: 200, data: [review()] }));

    expect(component.loading).toBeFalse();
    expect(component.reviews.length).toBe(1);
    expect(component.reviews[0].trainerName).toBe('Coach Sam');
  });

  it('shows the genuine empty state when the client has written nothing yet', () => {
    setup(of({ message: '', success: true, statusCode: 200, data: [] }));

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain("You haven't reviewed a trainer yet");
  });

  it('shows a retryable error instead of the empty state when the load fails', () => {
    setup(throwError(() => ({ error: { message: 'Server exploded' } })));

    expect(component.loading).toBeFalse();
    expect(component.loadError).toBe('Server exploded');
    expect(snackbar.openSnackBar).toHaveBeenCalledWith('Server exploded', 'error');
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).not.toContain("You haven't reviewed a trainer yet");
  });

  it('retrying reloads and clears the error once it succeeds', () => {
    setup(throwError(() => ({ error: { message: 'Server exploded' } })));
    clientService.getMyTrainerReviews.and.returnValue(of({ message: '', success: true, statusCode: 200, data: [review()] }));

    component.loadReviews();

    expect(component.loadError).toBeNull();
    expect(component.reviews.length).toBe(1);
  });

  it('hasPhotos is false when every before/after slot is empty', () => {
    setup(of({ message: '', success: true, statusCode: 200, data: [] }));
    expect(component.hasPhotos(review())).toBeFalse();
  });

  it('hasPhotos is true when at least one slot is filled', () => {
    setup(of({ message: '', success: true, statusCode: 200, data: [] }));
    expect(component.hasPhotos(review({ photoFrontBefore: { photoUrl: 'x' } as any }))).toBeTrue();
  });

  it('trainerSlug turns a trainer name into the URL slug used for their profile route', () => {
    setup(of({ message: '', success: true, statusCode: 200, data: [] }));
    expect(component.trainerSlug('Coach Sam')).toBe('coach-sam');
  });
});
