import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { MessagesMainComponent } from './messages-main.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { ConversationSummary, Message } from 'src/app/models/message.model';
import { MyTrainerSummary } from 'src/app/models/progress-share.model';

import * as MessageActions from 'src/app/state/message/message.actions';
import {
  selectActiveConversationMessages,
  selectActiveConversationUserId,
  selectConversations,
  selectIsActivePartyTyping,
  selectLoadingConversation,
  selectMessageError,
  selectMessageLoading,
} from 'src/app/state/message/message.selectors';
import { loadMyTrainers } from 'src/app/state/booking/booking.actions';
import { selectMyTrainers } from 'src/app/state/booking/booking.selectors';
import { loadMyConnections } from 'src/app/state/connection/connection.actions';
import { selectMyConnections } from 'src/app/state/connection/connection.selectors';
import { Connection } from 'src/app/models/connection.model';

describe('MessagesMainComponent', () => {
  let component: MessagesMainComponent;
  let fixture: ComponentFixture<MessagesMainComponent>;
  let store: MockStore;

  const conversations: ConversationSummary[] = [
    { otherUserId: 5, otherUserName: 'Coach Sam', otherUserRole: 'trainer', lastMessage: 'Hey!', lastMessageDate: new Date(), unreadCount: 1 }
  ];

  const myTrainers: MyTrainerSummary[] = [
    { type: 'trainer', id: 9, userId: 5, name: 'Coach Sam', status: 'confirmed', lastBookingAt: new Date(), bookingCount: 2 },
    { type: 'trainer', id: 10, userId: 6, name: 'Coach Alex', status: 'confirmed', lastBookingAt: new Date(), bookingCount: 1 },
  ];

  const messages: Message[] = [
    { id: 1, senderId: 5, senderName: 'Coach Sam', recipientId: 1, recipientName: 'Jane Doe', body: 'Hey!', isRead: false, date: new Date(), lastUpdate: new Date(), deleted: false }
  ];

  const connections: Connection[] = [
    { id: 1, otherUserId: 7, otherUserName: 'Jordan Lee', otherUserRole: 'user', direction: 'incoming', status: 'accepted', date: new Date() }
  ];

  beforeEach(() => {
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [MessagesMainComponent],
      imports: [FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectConversations, value: conversations },
            { selector: selectMessageLoading, value: false },
            { selector: selectMyTrainers, value: myTrainers },
            { selector: selectMyConnections, value: connections },
            { selector: selectActiveConversationUserId, value: null },
            { selector: selectActiveConversationMessages, value: [] },
            { selector: selectLoadingConversation, value: false },
            { selector: selectIsActivePartyTyping, value: false },
            { selector: selectMessageError, value: null },
          ]
        }),
        { provide: SnackBarService, useValue: snackbarSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
      ]
    });

    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callThrough();

    fixture = TestBed.createComponent(MessagesMainComponent);
    component = fixture.componentInstance;
  });

  it('loads conversations and myTrainers from the store on init', () => {
    fixture.detectChanges();

    expect(component.conversations).toEqual(conversations);
    expect(store.dispatch).toHaveBeenCalledWith(MessageActions.loadConversations());
    expect(store.dispatch).toHaveBeenCalledWith(loadMyTrainers());
    expect(store.dispatch).toHaveBeenCalledWith(loadMyConnections());
  });

  it('startableContacts excludes trainers/connections who already have a conversation, and merges both sources', () => {
    fixture.detectChanges();

    expect(component.startableContacts.map(c => c.userId)).toEqual([6, 7]);
  });

  it('openConversation dispatches loadConversation and markConversationRead for that user', () => {
    fixture.detectChanges();
    (store.dispatch as jasmine.Spy).calls.reset();

    component.openConversation(5);

    expect(store.dispatch).toHaveBeenCalledWith(MessageActions.loadConversation({ otherUserId: 5 }));
    expect(store.dispatch).toHaveBeenCalledWith(MessageActions.markConversationRead({ otherUserId: 5 }));
  });

  // Regression test: startConversation used to only set the component's own
  // local activeUserId field, never the store's activeConversationUserId --
  // sendMessageSuccess's reducer only appends to activeConversationMessages
  // when the STORE's activeConversationUserId matches, so the first message
  // to a brand-new contact posted successfully but never appeared on screen.
  it('startConversation delegates to openConversation, updating the store (not just a local field)', () => {
    fixture.detectChanges();
    (store.dispatch as jasmine.Spy).calls.reset();

    component.startConversation({ userId: 7, name: 'Jordan Lee' });

    expect(store.dispatch).toHaveBeenCalledWith(MessageActions.loadConversation({ otherUserId: 7 }));
    expect(store.dispatch).toHaveBeenCalledWith(MessageActions.markConversationRead({ otherUserId: 7 }));
  });

  it('send dispatches sendMessage for the active conversation', () => {
    fixture.detectChanges();
    component.activeUserId = 5;

    component.send('Hello coach');

    expect(store.dispatch).toHaveBeenCalledWith(MessageActions.sendMessage({ request: { recipientId: 5, body: 'Hello coach' } }));
  });

  it('setTyping dispatches setTyping for the active conversation', () => {
    fixture.detectChanges();
    component.activeUserId = 5;

    component.setTyping(true);

    expect(store.dispatch).toHaveBeenCalledWith(MessageActions.setTyping({ otherUserId: 5, typing: true }));
  });

  it('unsend dispatches deleteMessage', () => {
    fixture.detectChanges();

    component.unsend(1);

    expect(store.dispatch).toHaveBeenCalledWith(MessageActions.deleteMessage({ messageId: 1 }));
  });

  it('lastMineMessageId finds the most recent own message in the open thread', () => {
    fixture.detectChanges();
    component.activeUserId = 5; // the other party -- so "mine" is anyone else
    component.activeMessages = [
      { ...messages[0], id: 1, senderId: 1 },
      { ...messages[0], id: 2, senderId: 5 },
      { ...messages[0], id: 3, senderId: 1 },
    ];

    expect(component.lastMineMessageId).toBe(3);
  });

  it('activeContact prefers the conversation summary (with role, for the Certified badge), falling back to a startable contact', () => {
    fixture.detectChanges();

    component.activeUserId = 5;
    expect(component.activeContact).toEqual({ userId: 5, name: 'Coach Sam', photo: undefined, role: 'trainer' });

    component.activeUserId = 7; // a Connection, not yet in conversations
    expect(component.activeContact.name).toBe('Jordan Lee');
    expect(component.activeContact.role).toBe('');
  });

  it('isMine identifies a message as the current user\'s when it was not sent by the active conversation partner', () => {
    fixture.detectChanges();
    component.activeUserId = 5;

    expect(component.isMine(messages[0])).toBeFalse(); // sent BY the active partner (5) -> not mine
    expect(component.isMine({ ...messages[0], senderId: 1 })).toBeTrue();
  });

  it('dispatches clearActiveConversation on destroy', () => {
    fixture.detectChanges();
    (store.dispatch as jasmine.Spy).calls.reset();

    component.ngOnDestroy();

    expect(store.dispatch).toHaveBeenCalledWith(MessageActions.clearActiveConversation());
  });
});
