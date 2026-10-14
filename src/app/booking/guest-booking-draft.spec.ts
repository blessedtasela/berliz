import {
  GUEST_DRAFT_MAX_AGE_MS,
  clearGuestDraft,
  loadGuestDraft,
  pendingGuestBookingPath,
  saveGuestDraft,
} from './guest-booking-draft';

describe('guest booking draft', () => {

  const draft = {
    kind: 'trainer' as const,
    providerId: 7,
    date: '2030-05-01',
    slotStart: '09:00:00',
    notes: 'knee injury',
    path: '/trainers/Jo-Smith/book',
  };

  beforeEach(() => sessionStorage.clear());
  afterEach(() => sessionStorage.clear());

  it('gives back what was saved for the same provider', () => {
    saveGuestDraft(draft);
    const loaded = loadGuestDraft('trainer', 7);
    expect(loaded?.date).toBe('2030-05-01');
    expect(loaded?.slotStart).toBe('09:00:00');
    expect(loaded?.notes).toBe('knee injury');
  });

  it('does not hand a draft to a different provider or kind', () => {
    saveGuestDraft(draft);
    expect(loadGuestDraft('trainer', 8)).toBeNull();
    expect(loadGuestDraft('center', 7)).toBeNull();
  });

  it('forgets drafts older than the max age', () => {
    saveGuestDraft(draft, 1_000);
    expect(loadGuestDraft('trainer', 7, 1_000 + GUEST_DRAFT_MAX_AGE_MS - 1)).not.toBeNull();
    expect(loadGuestDraft('trainer', 7, 1_000 + GUEST_DRAFT_MAX_AGE_MS + 1)).toBeNull();
  });

  it('can be cleared', () => {
    saveGuestDraft(draft);
    clearGuestDraft();
    expect(loadGuestDraft('trainer', 7)).toBeNull();
  });

  it('survives garbage in storage', () => {
    sessionStorage.setItem('berliz.guestBooking.v1', '{not json');
    expect(loadGuestDraft('trainer', 7)).toBeNull();
    expect(pendingGuestBookingPath()).toBeNull();
  });

  it('offers the booking page to return to, but only a same-origin path', () => {
    saveGuestDraft(draft);
    expect(pendingGuestBookingPath()).toBe('/trainers/Jo-Smith/book');

    saveGuestDraft({ ...draft, path: '//evil.example/x' });
    expect(pendingGuestBookingPath()).toBeNull();
    saveGuestDraft({ ...draft, path: 'https://evil.example/x' });
    expect(pendingGuestBookingPath()).toBeNull();
  });

  it('does not throw when storage is unavailable', () => {
    spyOn(sessionStorage, 'setItem').and.throwError('blocked');
    spyOn(sessionStorage, 'getItem').and.throwError('blocked');
    expect(() => saveGuestDraft(draft)).not.toThrow();
    expect(loadGuestDraft('trainer', 7)).toBeNull();
    expect(pendingGuestBookingPath()).toBeNull();
  });
});
