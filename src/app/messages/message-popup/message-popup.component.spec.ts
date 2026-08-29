import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { MessagePopupComponent } from './message-popup.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { ConversationSummary, Message } from 'src/app/models/message.model';
import { MyTrainerSummary } from 'src/app/models/progress-share.model';
import { Users } from 'src/app/models/users.interface';

import * as MessageActions from 'src/app/state/message/message.actions';
import {
  selectActiveConversationMessages,
  selectActiveConversationUserId,
  selectConversations,
  selectLoadingConversation,
  selectMessageError,
  selectTotalUnreadCount,
} from 'src/app/state/message/message.selectors';
import { loadMyTrainers } from 'src/app/state/booking/booking.actions';
import { selectMyTrainers } from 'src/app/state/booking/booking.selectors';
import { loadMyConnections } from 'src/app/state/connection/connection.actions';
import { selectMyConnections } from 'src/app/state/connection/connection.selectors';
import { Connection } from 'src/app/models/connection.model';
import { selectUser } from 'src/app/state/user/user.selector';

describe('MessagePopupComponent', () => {
  let component: MessagePopupComponent;
  let fixture: ComponentFixture<MessagePopupComponent>;
  let store: MockStore;
  let router: jasmine.SpyObj<Router>;

  const conversations: ConversationSummary[] = [
    { otherUserId: 5, otherUserName: 'Coach Sam', otherUserRole: 'trainer', lastMessage: 'Hey!', lastMessageDate: new Date(), unreadCount: 1 }
  ];

  const myTrainers: MyTrainerSummary[] = [
    { type: 'trainer', id: 9, userId: 5, name: 'Coach Sam', status: 'confirmed', lastBookingAt: new Date(), bookingCount: 2 },
    { type: 'trainer', id: 10, userId: 6, name: 'Coach Alex', status: 'confirmed', lastBookingAt: new Date(), bookingCount: 1 },
  ];

  const messages: Message[] = [
    { id: 1, senderId: 5, senderName: 'Coach Sam', recipientId: 1, recipientName: 'Jane Doe', body: 'Hey!', isRead: false, date: new Date(), lastUpdate: new Date() }
  ];

  const connections: Connection[] = [
    { id: 1, otherUserId: 7, otherUserName: 'Jordan Lee', otherUserRole: 'user', direction: 'incoming', status: 'accepted', date: new Date() }
  ];

  function setup(user: Partial<Users> | null, url = '/dashboard/home') {
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    router = jasmine.createSpyObj('Router', ['navigate'], { url, events: of() });

    TestBed.configureTestingModule({
      declarations: [MessagePopupComponent],
      imports: [FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectConversations, value: conversations },
            { selector: selectTotalUnreadCount, value: 1 },
            { selector: selectMyTrainers, value: myTrainers },
            { selector: selectMyConnections, value: connections },
            { selector: selectActiveConversationUserId, value: null },
            { selector: selectActiveConversationMessages, value: [] },
            { selector: selectLoadingConversation, value: false },
            { selector: selectMessageError, value: null },
            { selector: selectUser, value: user },
          ]
        }),
        { provide: SnackBarService, useValue: snackbarSpy },
        { provide: Router, useValue: router },
      ]
    });

    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callThrough();

    fixture = TestBed.createComponent(MessagePopupComponent);
    component = fixture.componentInstance;
  }

  it('shows the bubble (popupEnabled true) when the user has not opted out', () => {
    setup({ messagePopupEnabled: true } as Partial<Users>);
    fixture.detectChanges();

    expect(component.popupEnabled).toBeTrue();
    expect(store.dispatch).toHaveBeenCalledWith(MessageActions.loadConversations());
    expect(store.dispatch).toHaveBeenCalledWith(loadMyTrainers());
    expect(store.dispatch).toHaveBeenCalledWith(loadMyConnections());
  });

  it('defaults popupEnabled to true when the field is undefined', () => {
    setup({} as Partial<Users>);
    fixture.detectChanges();

    expect(component.popupEnabled).toBeTrue();
  });

  it('hides the bubble when the user turned the setting off', () => {
    setup({ messagePopupEnabled: false } as Partial<Users>);
    fixture.detectChanges();

    expect(component.popupEnabled).toBeFalse();
  });

  it('starts closed and toggles open/closed on togglePopup/closePopup', () => {
    setup({ messagePopupEnabled: true } as Partial<Users>);
    fixture.detectChanges();

    expect(component.open).toBeFalse();
    component.togglePopup();
    expect(component.open).toBeTrue();
    component.closePopup();
    expect(component.open).toBeFalse();
  });

  it('startableContacts excludes trainers/connections who already have a conversation, and merges both sources', () => {
    setup({ messagePopupEnabled: true } as Partial<Users>);
    fixture.detectChanges();

    expect(component.startableContacts.map(c => c.userId)).toEqual([6, 7]);
  });

  it('openConversation dispatches loadConversation and markConversationRead, and switches to thread view', () => {
    setup({ messagePopupEnabled: true } as Partial<Users>);
    fixture.detectChanges();
    (store.dispatch as jasmine.Spy).calls.reset();

    component.openConversation(5);

    expect(store.dispatch).toHaveBeenCalledWith(MessageActions.loadConversation({ otherUserId: 5 }));
    expect(store.dispatch).toHaveBeenCalledWith(MessageActions.markConversationRead({ otherUserId: 5 }));
    expect(component.view).toBe('thread');
  });

  // Regression test: startConversation used to only set the component's own
  // local activeUserId field, never the store's activeConversationUserId --
  // sendMessageSuccess's reducer only appends to activeConversationMessages
  // when the STORE's activeConversationUserId matches, so the first message
  // to a brand-new contact posted successfully but never appeared on screen.
  it('startConversation delegates to openConversation, updating the store (not just a local field)', () => {
    setup({ messagePopupEnabled: true } as Partial<Users>);
    fixture.detectChanges();
    (store.dispatch as jasmine.Spy).calls.reset();

    component.startConversation({ userId: 7, name: 'Jordan Lee' });

    expect(store.dispatch).toHaveBeenCalledWith(MessageActions.loadConversation({ otherUserId: 7 }));
    expect(store.dispatch).toHaveBeenCalledWith(MessageActions.markConversationRead({ otherUserId: 7 }));
    expect(component.view).toBe('thread');
  });

  it('send dispatches sendMessage with the draft body and clears it', () => {
    setup({ messagePopupEnabled: true } as Partial<Users>);
    fixture.detectChanges();
    component.activeUserId = 5;
    component.draftBody = 'Hello coach';

    component.send();

    expect(store.dispatch).toHaveBeenCalledWith(MessageActions.sendMessage({ request: { recipientId: 5, body: 'Hello coach' } }));
    expect(component.draftBody).toBe('');
  });

  it('isMine identifies a message as the current user\'s when it was not sent by the active conversation partner', () => {
    setup({ messagePopupEnabled: true } as Partial<Users>);
    fixture.detectChanges();
    component.activeUserId = 5;

    expect(component.isMine(messages[0])).toBeFalse();
    expect(component.isMine({ ...messages[0], senderId: 1 })).toBeTrue();
  });

  it('goToFullPage closes the popup and navigates to /dashboard/messages', () => {
    setup({ messagePopupEnabled: true } as Partial<Users>);
    fixture.detectChanges();
    component.open = true;

    component.goToFullPage();

    expect(component.open).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/messages']);
  });

  it('hides itself when already on the full-page messaging center', () => {
    setup({ messagePopupEnabled: true } as Partial<Users>, '/dashboard/messages');
    fixture.detectChanges();

    expect(component.onMessagesPage).toBeTrue();
  });

  // Regression: the bubble/panel sat at a fixed bottom offset that visually
  // collided with the scroll-to-top button once it appeared in the same corner.
  describe('raised state (avoids overlapping the scroll-to-top button)', () => {
    it('is not raised before scrolling', () => {
      setup({ messagePopupEnabled: true } as Partial<Users>);
      fixture.detectChanges();

      expect(component.raised).toBeFalse();
    });

    it('raises once scrolled past the scroll-to-top button\'s own show threshold', () => {
      setup({ messagePopupEnabled: true } as Partial<Users>);
      fixture.detectChanges();
      spyOnProperty(window, 'scrollY').and.returnValue(2500);

      component.onWindowScroll();

      expect(component.raised).toBeTrue();
    });

    it('lowers back down once scrolled back up', () => {
      setup({ messagePopupEnabled: true } as Partial<Users>);
      fixture.detectChanges();
      const scrollY = spyOnProperty(window, 'scrollY').and.returnValue(2500);
      component.onWindowScroll();

      scrollY.and.returnValue(0);
      component.onWindowScroll();

      expect(component.raised).toBeFalse();
    });
  });
});
