import { of, throwError } from 'rxjs';
import { PaymentCodeRequest } from 'src/app/models/payment-code.model';
import { PaymentCodesComponent } from './payment-codes.component';

describe('PaymentCodesComponent', () => {

  let page: any;
  let codes: Record<string, jasmine.Spy>;
  let snackBar: { openSnackBar: jasmine.Spy };

  const request = (over: Partial<PaymentCodeRequest> = {}): PaymentCodeRequest => ({
    id: 11, status: 'PENDING', targetType: 'BOOKING', targetLabel: 'booking BK-000050', bookingId: 50, packageId: null, subscriptionId: null,
    clientId: 1, clientName: 'Sam Client', clientEmail: 'sam@example.com', providerUserId: 2, providerName: 'Coach Jane',
    requestedByName: 'Jane Coach', requestedByRole: 'PROVIDER', reason: 'Pays cash', usesRequested: 1, decidedByName: null,
    decidedAt: null, decisionNote: null, forwardedAt: null, date: '2026-11-01', codeId: null, ...over,
  });

  beforeEach(() => {
    snackBar = { openSnackBar: jasmine.createSpy('openSnackBar') };
    codes = {
      request: jasmine.createSpy('request').and.returnValue(of({ message: 'Sent', data: request() })),
      forward: jasmine.createSpy('forward').and.returnValue(of({ data: request() })),
      decline: jasmine.createSpy('decline').and.returnValue(of({ data: request() })),
      cancel: jasmine.createSpy('cancel').and.returnValue(of({ data: request() })),
      approve: jasmine.createSpy('approve').and.returnValue(of({ data: request({ status: 'APPROVED' }) })),
      reject: jasmine.createSpy('reject').and.returnValue(of({ data: request({ status: 'REJECTED' }) })),
      revoke: jasmine.createSpy('revoke').and.returnValue(of({ data: {} })),
      myCodes: jasmine.createSpy('myCodes').and.returnValue(of({ data: [] })),
      myRequests: jasmine.createSpy('myRequests').and.returnValue(of({ data: [] })),
      adminRequests: jasmine.createSpy('adminRequests').and.returnValue(of({ data: [] })),
      adminCodes: jasmine.createSpy('adminCodes').and.returnValue(of({ data: [] })),
    };
    page = Object.create(PaymentCodesComponent.prototype);
    page.codes = codes;
    page.snackBar = snackBar;
    page.user = { id: 2, role: 'trainer' };
    page.isSuperAdmin = false;
    page.myCodes = []; page.myRequests = []; page.adminRequests = []; page.adminCodes = [];
    page.decision = {};
    page.form = { targetType: 'BOOKING', bookingId: 50, packageId: null, subscriptionId: null, clientId: null, uses: 1, reason: 'Pays cash' };
  });

  describe('who sees what', () => {
    it('a trainer or center can ask for codes, a client cannot', () => {
      expect(page.isProvider).toBeTrue();
      page.user = { id: 1, role: 'user' };
      expect(page.isProvider).toBeFalse();
      page.user = { id: 3, role: 'center' };
      expect(page.isProvider).toBeTrue();
    });

    it('splits the administration queue into waiting and decided', () => {
      page.adminRequests = [request({ id: 1 }), request({ id: 2, status: 'APPROVED' }), request({ id: 3, status: 'REJECTED' })];
      expect(page.pendingForAdmin.map((r: PaymentCodeRequest) => r.id)).toEqual([1]);
      expect(page.decidedForAdmin.length).toBe(2);
    });

    it('lists the client requests a trainer still has to forward or decline', () => {
      page.myRequests = [request({ id: 1, status: 'ASKED', providerUserId: 2 }), request({ id: 2, status: 'ASKED', providerUserId: 9 }), request({ id: 3, status: 'PENDING' })];
      expect(page.askedOfMe.map((r: PaymentCodeRequest) => r.id)).toEqual([1]);
    });
  });

  describe('a trainer asking the administration', () => {
    it('needs a reason, and the right number for what it is about', () => {
      page.form.reason = '  ';
      page.submitRequest();
      expect(page.formError).toContain('why this client');

      page.form = { ...page.form, reason: 'Hardship', bookingId: null };
      page.submitRequest();
      expect(page.formError).toBe('Enter the booking number.');

      page.form = { ...page.form, targetType: 'PACKAGE', packageId: 30, clientId: null };
      page.submitRequest();
      expect(page.formError).toBe('Enter the package number and the client number.');
      expect(codes['request']).not.toHaveBeenCalled();
    });

    it('sends the request and switches to the requests list', () => {
      page.submitRequest();
      expect(codes['request']).toHaveBeenCalledWith(jasmine.objectContaining({ targetType: 'BOOKING', bookingId: 50, reason: 'Pays cash', uses: 1 }));
      expect(page.tab).toBe('requests');
      expect(page.sending).toBeFalse();
    });

    it('shows the server reason when the request is refused', () => {
      codes['request'].and.returnValue(throwError(() => ({ error: { message: 'There is already an open request for this.' } })));
      page.submitRequest();
      expect(page.formError).toBe('There is already an open request for this.');
      expect(page.sending).toBeFalse();
    });

    it('forwards, declines and withdraws a request', () => {
      page.forward(request({ id: 5 }));
      page.decline(request({ id: 6 }));
      page.withdraw(request({ id: 7 }));
      expect(codes['forward']).toHaveBeenCalledWith(5);
      expect(codes['decline']).toHaveBeenCalledWith(6);
      expect(codes['cancel']).toHaveBeenCalledWith(7);
    });
  });

  describe('the super admin', () => {
    it('approves with the chosen uses and validity, and reloads', () => {
      page.isSuperAdmin = true;
      page.decision[11] = { uses: 3, validDays: 30, note: 'ok' };
      page.approve(request());
      expect(codes['approve']).toHaveBeenCalledWith(11, { uses: 3, validDays: 30, note: 'ok' });
      expect(codes['adminRequests']).toHaveBeenCalled();
      expect(page.busyId).toBeNull();
    });

    it('rejects with a note', () => {
      page.decision[11] = { uses: 1, validDays: 14, note: 'Please pay' };
      page.reject(request());
      expect(codes['reject']).toHaveBeenCalledWith(11, { note: 'Please pay' });
    });

    it('does not revoke a code until the admin confirms', () => {
      const code: any = { id: 4, state: 'ACTIVE' };
      spyOn(window, 'confirm').and.returnValue(false);
      page.revoke(code);
      expect(codes['revoke']).not.toHaveBeenCalled();
      (window.confirm as jasmine.Spy).and.returnValue(true);
      page.revoke(code);
      expect(codes['revoke']).toHaveBeenCalledWith(4);
    });

    it('tells the admin when an action failed', () => {
      codes['approve'].and.returnValue(throwError(() => ({ error: { message: 'That request has already been handled.' } })));
      page.decision[11] = { uses: 1, validDays: 14, note: '' };
      page.approve(request());
      expect(snackBar.openSnackBar).toHaveBeenCalledWith('That request has already been handled.', 'error');
    });
  });

  describe('labels', () => {
    it('names every state in plain words', () => {
      expect(page.statusLabel('ASKED')).toBe('Waiting for the trainer');
      expect(page.statusLabel('PENDING')).toBe('With the administration');
      expect(page.statusLabel('ACTIVE')).toBe('Ready to use');
      expect(page.statusLabel('USED_UP')).toBe('Used');
    });
  });
});
