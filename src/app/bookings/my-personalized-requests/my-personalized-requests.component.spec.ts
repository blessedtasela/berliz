import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { PersonalizedRequest } from 'src/app/models/personalized-request.model';
import { PersonalizedRequestService } from 'src/app/services/personalized-request.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { MyPersonalizedRequestsComponent } from './my-personalized-requests.component';

describe('MyPersonalizedRequestsComponent', () => {
  let fixture: ComponentFixture<MyPersonalizedRequestsComponent>;
  let component: MyPersonalizedRequestsComponent;
  let service: jasmine.SpyObj<PersonalizedRequestService>;
  let snackBar: jasmine.SpyObj<SnackBarService>;

  const request = (over: Partial<PersonalizedRequest> = {}): PersonalizedRequest => ({
    id: 1, clientId: 2, clientName: 'Rish Client', trainerId: 9, trainerName: 'Coach Jane',
    description: 'A 3-session plan', proposedSessions: 3, proposedAmount: 300, status: 'REQUESTED',
    date: new Date('2026-11-10T12:00:00Z'), lastUpdate: new Date('2026-11-10T12:00:00Z'), ...over,
  } as PersonalizedRequest);

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';
  const q = (sel: string) => fixture.nativeElement.querySelector(sel) as HTMLElement | null;

  function show(requests: PersonalizedRequest[]): void {
    service.getMyRequests.and.returnValue(of({ data: requests } as any));
    component.ngOnInit();
    fixture.detectChanges();
  }

  beforeEach(() => {
    service = jasmine.createSpyObj('PersonalizedRequestService', ['getMyRequests', 'acceptCounter', 'walkAway', 'checkout']);
    snackBar = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    TestBed.configureTestingModule({
      imports: [MyPersonalizedRequestsComponent],
      providers: [
        { provide: PersonalizedRequestService, useValue: service },
        { provide: SnackBarService, useValue: snackBar },
      ],
    });
    fixture = TestBed.createComponent(MyPersonalizedRequestsComponent);
    component = fixture.componentInstance;
  });

  it('shows nothing when there are no requests', () => {
    show([]);
    expect(q('[data-testid="my-personalized-requests"]')).toBeNull();
  });

  it('lists a request and its plain-language status', () => {
    show([request()]);
    expect(text()).toContain('Coach Jane');
    expect(text()).toContain('You offered CA$300.00');
    expect(text()).toContain('Waiting for the trainer to respond');
  });

  it('shows the trainer counter and lets the client accept it', () => {
    service.acceptCounter.and.returnValue(of({ data: { message: 'Counter-offer accepted' } } as any));
    show([request({ status: 'COUNTERED', counterAmount: 250, trainerNote: 'Needs one more session' })]);
    expect(text()).toContain('The trainer countered your offer');
    expect(text()).toContain('Needs one more session');
    (q('[data-testid="accept-counter"]') as HTMLButtonElement).click();
    expect(service.acceptCounter).toHaveBeenCalledWith(1);
  });

  it('walking away asks first and does nothing until confirmed', () => {
    service.walkAway.and.returnValue(of({ data: { message: 'You walked away from the counter-offer' } } as any));
    show([request({ status: 'COUNTERED', counterAmount: 250 })]);
    const walkAwayLink = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(b => b.textContent?.trim() === 'Walk away');
    walkAwayLink?.click();
    fixture.detectChanges();
    expect(service.walkAway).not.toHaveBeenCalled();
    expect(text()).toContain('Walk away from this offer?');

    (q('[data-testid="confirm-walk-away"]') as HTMLButtonElement).click();
    expect(service.walkAway).toHaveBeenCalledWith(1);
  });

  it('pays an accepted request by redirecting to the Stripe checkout url', () => {
    service.checkout.and.returnValue(of({ data: { checkoutUrl: 'https://checkout.stripe.com/pay/cs_1' } } as any));
    spyOn(component, 'redirect');
    show([request({ status: 'ACCEPTED', agreedAmount: 300 })]);
    (q('[data-testid="pay-personalized-request"]') as HTMLButtonElement).click();
    expect(component.redirect).toHaveBeenCalledWith('https://checkout.stripe.com/pay/cs_1');
  });

  it('shows the server error when checkout fails to return a url', () => {
    service.checkout.and.returnValue(of({ message: 'Stripe request failed. Please try again later.' } as any));
    show([request({ status: 'ACCEPTED', agreedAmount: 300 })]);
    (q('[data-testid="pay-personalized-request"]') as HTMLButtonElement).click();
    expect(snackBar.openSnackBar).toHaveBeenCalledWith('Stripe request failed. Please try again later.', 'error');
    expect(component.busyPayId).toBeNull();
  });

  it('surfaces the server error when acceptCounter fails', () => {
    service.acceptCounter.and.returnValue(throwError(() => ({ error: { message: 'There is no counter-offer to respond to on this request.' } })));
    show([request({ status: 'COUNTERED', counterAmount: 250 })]);
    (q('[data-testid="accept-counter"]') as HTMLButtonElement).click();
    expect(snackBar.openSnackBar).toHaveBeenCalledWith('There is no counter-offer to respond to on this request.', 'error');
  });

  it('a failed load shows nothing rather than an error', () => {
    service.getMyRequests.and.returnValue(throwError(() => ({ error: { message: 'boom' } })));
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.requests).toEqual([]);
  });
});
