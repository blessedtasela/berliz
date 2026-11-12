import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { PersonalizedRequest } from 'src/app/models/personalized-request.model';
import { PersonalizedRequestService } from 'src/app/services/personalized-request.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PersonalizedRequestsForMeComponent } from './personalized-requests-for-me.component';

describe('PersonalizedRequestsForMeComponent', () => {
  let fixture: ComponentFixture<PersonalizedRequestsForMeComponent>;
  let component: PersonalizedRequestsForMeComponent;
  let service: jasmine.SpyObj<PersonalizedRequestService>;
  let snackBar: jasmine.SpyObj<SnackBarService>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const request = (over: Partial<PersonalizedRequest> = {}): PersonalizedRequest => ({
    id: 1, clientId: 2, clientName: 'Rish Client', trainerId: 9, trainerName: 'Coach Jane',
    description: 'A 3-session plan', proposedSessions: 3, proposedAmount: 300, status: 'REQUESTED',
    date: new Date('2026-11-10T12:00:00Z'), lastUpdate: new Date('2026-11-10T12:00:00Z'), ...over,
  } as PersonalizedRequest);

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';
  const q = (sel: string) => fixture.nativeElement.querySelector(sel) as HTMLElement | null;

  function show(requests: PersonalizedRequest[]): void {
    service.getRequestsForMe.and.returnValue(of({ data: requests } as any));
    component.ngOnInit();
    fixture.detectChanges();
  }

  beforeEach(() => {
    service = jasmine.createSpyObj('PersonalizedRequestService', ['getRequestsForMe', 'accept', 'counter', 'decline']);
    snackBar = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    TestBed.configureTestingModule({
      imports: [PersonalizedRequestsForMeComponent],
      providers: [
        { provide: PersonalizedRequestService, useValue: service },
        { provide: SnackBarService, useValue: snackBar },
        { provide: MatDialog, useValue: dialog },
      ],
    })
      // PersonalizedRequestsForMeComponent imports MatDialogModule for its own template, which
      // re-provides a real MatDialog at the component's injector level and shadows the override
      // above unless stripped -- same fix dashboard-timeline.component.spec.ts uses.
      .overrideComponent(PersonalizedRequestsForMeComponent, { set: { imports: [CommonModule, IconsModule], schemas: [NO_ERRORS_SCHEMA] } });
    fixture = TestBed.createComponent(PersonalizedRequestsForMeComponent);
    component = fixture.componentInstance;
  });

  it('shows nothing when there are no requests', () => {
    show([]);
    expect(q('[data-testid="personalized-requests-for-me"]')).toBeNull();
  });

  it('lists a new request with what the client offered', () => {
    show([request()]);
    expect(text()).toContain('Rish Client');
    expect(text()).toContain('3 sessions');
    expect(text()).toContain('CA$300.00');
    expect(text()).toContain('A 3-session plan');
  });

  it('accepts at the proposed amount', () => {
    service.accept.and.returnValue(of({ data: { message: 'Request accepted' } } as any));
    show([request()]);
    (q('[data-testid="accept-request"]') as HTMLButtonElement).click();
    expect(service.accept).toHaveBeenCalledWith(1);
    expect(snackBar.openSnackBar).toHaveBeenCalledWith('Request accepted', '');
  });

  it('declining asks first and does nothing until confirmed', () => {
    service.decline.and.returnValue(of({ data: { message: 'Request declined' } } as any));
    show([request()]);
    (q('[data-testid="counter-request"]')); // sanity: counter button exists alongside decline
    const declineLink = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(b => b.textContent?.trim() === 'Decline');
    declineLink?.click();
    fixture.detectChanges();
    expect(service.decline).not.toHaveBeenCalled();
    expect(text()).toContain('Decline this request?');

    (q('[data-testid="confirm-decline-request"]') as HTMLButtonElement).click();
    expect(service.decline).toHaveBeenCalledWith(1);
  });

  it('opens the counter-offer dialog and sends the result', () => {
    dialog.open.and.returnValue({ afterClosed: () => of({ counterAmount: 250, note: 'Needs one more session' }) } as any);
    service.counter.and.returnValue(of({ data: { message: 'Counter-offer sent' } } as any));
    show([request()]);
    (q('[data-testid="counter-request"]') as HTMLButtonElement).click();
    expect(service.counter).toHaveBeenCalledWith(1, 250, 'Needs one more session');
  });

  it('does nothing when the counter-offer dialog is dismissed', () => {
    dialog.open.and.returnValue({ afterClosed: () => of(undefined) } as any);
    show([request()]);
    (q('[data-testid="counter-request"]') as HTMLButtonElement).click();
    expect(service.counter).not.toHaveBeenCalled();
  });

  it('shows the countered/accepted/paid status lines', () => {
    show([request({ status: 'COUNTERED', counterAmount: 250 })]);
    expect(text()).toContain('You countered at CA$250.00');

    show([request({ status: 'ACCEPTED', agreedAmount: 300 })]);
    expect(text()).toContain('Agreed at CA$300.00');

    show([request({ status: 'PAID' })]);
    expect(text()).toContain('Paid. You can start the work.');
  });

  it('surfaces the server error when accept fails', () => {
    service.accept.and.returnValue(throwError(() => ({ error: { message: 'This request has already been handled.' } })));
    show([request()]);
    (q('[data-testid="accept-request"]') as HTMLButtonElement).click();
    expect(snackBar.openSnackBar).toHaveBeenCalledWith('This request has already been handled.', 'error');
    expect(component.busy).toBeFalse();
  });

  it('a failed load shows nothing rather than an error', () => {
    service.getRequestsForMe.and.returnValue(throwError(() => ({ error: { message: 'boom' } })));
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.requests).toEqual([]);
    expect(q('[data-testid="personalized-requests-for-me"]')).toBeNull();
  });
});
