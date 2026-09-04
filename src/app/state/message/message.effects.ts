import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { MessageService } from '../../services/message.service';
import { RxStompService } from '../../services/rx-stomp.service';
import { BrowserNotificationService } from '../../services/browser-notification.service';
import { Message } from '../../models/message.model';
import * as A from './message.actions';

@Injectable()
export class MessageEffects {

  constructor(
    private actions$: Actions,
    private svc: MessageService,
    private rxStompService: RxStompService,
    private browserNotifications: BrowserNotificationService,
    private router: Router,
  ) { }

  loadConversations$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadConversations),
    mergeMap(() => this.svc.getConversations().pipe(
      map(response => A.loadConversationsSuccess({ response })),
      catchError(e => of(A.loadConversationsFailure({ error: e?.error?.message || 'Failed to load conversations' })))
    ))
  ));

  loadConversation$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadConversation),
    mergeMap(({ otherUserId }) => this.svc.getConversation(otherUserId).pipe(
      map(response => A.loadConversationSuccess({ response, otherUserId })),
      catchError(e => of(A.loadConversationFailure({ error: e?.error?.message || 'Failed to load conversation' })))
    ))
  ));

  sendMessage$ = createEffect(() => this.actions$.pipe(
    ofType(A.sendMessage),
    mergeMap(({ request }) => this.svc.send(request).pipe(
      map(response => A.sendMessageSuccess({ response })),
      catchError(e => of(A.sendMessageFailure({ error: e?.error?.message || 'Failed to send message' })))
    ))
  ));

  markConversationRead$ = createEffect(() => this.actions$.pipe(
    ofType(A.markConversationRead),
    mergeMap(({ otherUserId }) => this.svc.markConversationRead(otherUserId).pipe(
      map(() => A.markConversationReadSuccess({ otherUserId })),
      catchError(e => of(A.markConversationReadFailure({ error: e?.error?.message || 'Failed to mark conversation read' })))
    ))
  ));

  editMessage$ = createEffect(() => this.actions$.pipe(
    ofType(A.editMessage),
    mergeMap(({ messageId, request }) => this.svc.editMessage(messageId, request).pipe(
      map(response => A.editMessageSuccess({ response })),
      catchError(e => of(A.editMessageFailure({ error: e?.error?.message || 'Failed to edit message' })))
    ))
  ));

  deleteMessage$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteMessage),
    mergeMap(({ messageId }) => this.svc.deleteMessage(messageId).pipe(
      map(response => A.deleteMessageSuccess({ response })),
      catchError(e => of(A.deleteMessageFailure({ error: e?.error?.message || 'Failed to unsend message' })))
    ))
  ));

  // Fire-and-forget -- the sender doesn't need a success/failure round trip,
  // the recipient finds out via /user/queue/message-events like everyone else.
  setTyping$ = createEffect(() => this.actions$.pipe(
    ofType(A.setTyping),
    mergeMap(({ otherUserId, typing }) => this.svc.setTyping(otherUserId, typing).pipe(
      catchError(() => of(null)) // best-effort; a dropped typing signal isn't worth surfacing
    ))
  ), { dispatch: false });

  // Live push -- unlike every other watch() in the app (a refresh signal),
  // this one carries the actual Message payload straight from the private
  // per-user queue the backend's convertAndSendToUser delivers to. Requires
  // the STOMP connection to actually be authenticated (see
  // my-rx-stomp.config.ts's beforeConnect) -- an unauthenticated session
  // never receives anything on /user/queue/*, it just silently never fires.
  receiveMessage$ = createEffect(() => this.rxStompService.watch('/user/queue/messages').pipe(
    map(stompMessage => A.receiveMessage({ message: JSON.parse(stompMessage.body) as Message }))
  ));

  /** Only fires while the page is hidden (see BrowserNotificationService) — no point popping a system alert for something already on screen. */
  notifyOnReceivedMessage$ = createEffect(() => this.actions$.pipe(
    ofType(A.receiveMessage),
    tap(({ message }) => {
      this.browserNotifications.notify(
        'message',
        message.senderName || 'New message',
        message.body,
        () => this.router.navigate(['/dashboard/messages']),
      );
    })
  ), { dispatch: false });
  // The second private queue -- typing signals and edited/deleted echoes,
  // separate from /user/queue/messages so a plain new-message listener never
  // has to filter these out. See MessageEventResponse on the backend.
  receiveMessageEvents$ = createEffect(() => this.rxStompService.watch('/user/queue/message-events').pipe(
    map(stompMessage => {
      const event = JSON.parse(stompMessage.body) as {
        type: 'edited' | 'deleted' | 'typing';
        message?: Message;
        fromUserId?: number;
        fromName?: string;
        typing?: boolean;
      };

      if (event.type === 'typing') {
        return A.receiveTyping({
          fromUserId: event.fromUserId as number,
          fromName: event.fromName as string,
          typing: !!event.typing,
        });
      }

      return A.receiveMessageEvent({ kind: event.type, message: event.message as Message });
    })
  ));
}
