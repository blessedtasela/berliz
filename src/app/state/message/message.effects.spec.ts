import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError, firstValueFrom } from 'rxjs';

import { MessageEffects } from './message.effects';
import { MessageService } from '../../services/message.service';
import { RxStompService } from '../../services/rx-stomp.service';
import * as A from './message.actions';
import { ApiResponse } from '../../models/Api.interface';
import { ConversationSummary, Message } from '../../models/message.model';

describe('MessageEffects', () => {
  let actions$: Observable<any>;
  let effects: MessageEffects;
  let serviceSpy: jasmine.SpyObj<MessageService>;
  let rxStompSpy: jasmine.SpyObj<RxStompService>;

  const sampleMessage: Message = {
    id: 1, senderId: 5, senderName: 'Coach Sam', recipientId: 1, recipientName: 'Jane Doe',
    body: 'Hey!', isRead: false, date: new Date(), lastUpdate: new Date(), deleted: false,
  };

  const sampleConversation: ConversationSummary = {
    otherUserId: 5, otherUserName: 'Coach Sam', otherUserRole: 'trainer',
    lastMessage: 'Hey!', lastMessageDate: new Date(), unreadCount: 1,
  };

  beforeEach(() => {
    serviceSpy = jasmine.createSpyObj('MessageService', [
      'send', 'getConversation', 'getConversations', 'markConversationRead'
    ]);
    rxStompSpy = jasmine.createSpyObj('RxStompService', ['watch']);
    rxStompSpy.watch.and.returnValue(of({ body: JSON.stringify(sampleMessage) } as any));

    TestBed.configureTestingModule({
      providers: [
        MessageEffects,
        provideMockActions(() => actions$),
        { provide: MessageService, useValue: serviceSpy },
        { provide: RxStompService, useValue: rxStompSpy },
      ]
    });

    effects = TestBed.inject(MessageEffects);
  });

  it('loadConversations$ dispatches loadConversationsSuccess with the conversations returned by the service', async () => {
    const response: ApiResponse<ConversationSummary[]> = { message: 'ok', data: [sampleConversation], success: true, statusCode: 200 };
    serviceSpy.getConversations.and.returnValue(of(response));
    actions$ = of(A.loadConversations());

    const result = await firstValueFrom(effects.loadConversations$);

    expect(result).toEqual(A.loadConversationsSuccess({ response }));
  });

  it('loadConversation$ dispatches loadConversationSuccess carrying otherUserId for reducer bookkeeping', async () => {
    const response: ApiResponse<Message[]> = { message: 'ok', data: [sampleMessage], success: true, statusCode: 200 };
    serviceSpy.getConversation.and.returnValue(of(response));
    actions$ = of(A.loadConversation({ otherUserId: 5 }));

    const result = await firstValueFrom(effects.loadConversation$);

    expect(result).toEqual(A.loadConversationSuccess({ response, otherUserId: 5 }));
    expect(serviceSpy.getConversation).toHaveBeenCalledWith(5);
  });

  it('sendMessage$ dispatches sendMessageSuccess with the message returned by the service', async () => {
    const response: ApiResponse<Message> = { message: 'Message sent', data: sampleMessage, success: true, statusCode: 200 };
    serviceSpy.send.and.returnValue(of(response));
    actions$ = of(A.sendMessage({ request: { recipientId: 5, body: 'Hey!' } }));

    const result = await firstValueFrom(effects.sendMessage$);

    expect(result).toEqual(A.sendMessageSuccess({ response }));
  });

  it('sendMessage$ dispatches sendMessageFailure with the 403 relationship-denied message', async () => {
    serviceSpy.send.and.returnValue(
      throwError(() => ({ error: { message: 'You can only message a trainer or client you have a booking history with.' } }))
    );
    actions$ = of(A.sendMessage({ request: { recipientId: 5, body: 'Hey!' } }));

    const result = await firstValueFrom(effects.sendMessage$);

    expect(result).toEqual(A.sendMessageFailure({ error: 'You can only message a trainer or client you have a booking history with.' }));
  });

  it('markConversationRead$ dispatches markConversationReadSuccess carrying otherUserId', async () => {
    serviceSpy.markConversationRead.and.returnValue(of({ message: 'ok', data: 'ok', success: true, statusCode: 200 }));
    actions$ = of(A.markConversationRead({ otherUserId: 5 }));

    const result = await firstValueFrom(effects.markConversationRead$);

    expect(result).toEqual(A.markConversationReadSuccess({ otherUserId: 5 }));
  });

  it('receiveMessage$ dispatches receiveMessage with the payload parsed from the private queue', async () => {
    const result = await firstValueFrom(effects.receiveMessage$);

    // JSON.parse (like a real STOMP frame body) yields ISO date strings, not
    // Date instances -- same as every other REST/WebSocket payload in this
    // app, only ever turned into a real Date where formatted (the `date` pipe).
    expect(result).toEqual(A.receiveMessage({
      message: { ...sampleMessage, date: sampleMessage.date.toISOString(), lastUpdate: sampleMessage.lastUpdate.toISOString() } as any
    }));
    expect(rxStompSpy.watch).toHaveBeenCalledWith('/user/queue/messages');
  });
});
