import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subject, Subscription, takeUntil } from 'rxjs';

import { ConversationSummary, Message } from 'src/app/models/message.model';
import { ComposerSendPayload } from 'src/app/messages/shared/message-composer/message-composer.component';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
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
import { ConversationRowData } from 'src/app/messages/shared/conversation-row/conversation-row.component';

import { loadMyTrainers } from 'src/app/state/booking/booking.actions';
import { selectMyTrainers } from 'src/app/state/booking/booking.selectors';

import { loadMyConnections } from 'src/app/state/connection/connection.actions';
import { selectMyConnections } from 'src/app/state/connection/connection.selectors';
import { Connection } from 'src/app/models/connection.model';

import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PhotoLightboxService } from 'src/app/services/photo-lightbox.service';
import { genericError } from 'src/validators/form-validators.module';

/** A person you can start (or already have) a conversation with -- either a booked trainer or an accepted Connection. */
interface StartableContact {
  userId: number;
  name: string;
}

/**
 * Conversation list + thread view. New conversations start from two sources:
 * the client's own "my trainers" list (booking-derived, already fetched for
 * progress-sharing) and accepted Connections (the request/accept flow that
 * lets any two users opt into messaging without a booking -- see
 * ConnectionServiceImplement). A trainer-side "my clients" picker for the
 * booking side is a natural follow-up once that list exists as its own
 * feature; Connections already work both directions today.
 */
@Component({
  selector: 'app-messages-main',
  templateUrl: './messages-main.component.html',
  styleUrls: ['./messages-main.component.css']
})
export class MessagesMainComponent implements OnInit, OnDestroy {

  conversations: ConversationSummary[] = [];
  loading = true;

  myTrainers: MyTrainerSummary[] = [];
  connections: Connection[] = [];

  activeUserId: number | null = null;
  activeMessages: Message[] = [];
  loadingConversation = false;
  activePartyTyping = false;

  /** Set by a bubble's "Reply"/"Edit" action; consumed by the composer, one active at a time. */
  replyTo: Message | null = null;
  editingMessage: Message | null = null;

  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private snackBar: SnackBarService,
    public lightbox: PhotoLightboxService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.store.dispatch(MessageActions.loadConversations());
    this.store.dispatch(loadMyTrainers());
    this.store.dispatch(loadMyConnections());

    this.subscriptions.push(
      this.store.select(selectConversations).pipe(takeUntil(this.destroy$)).subscribe(c => this.conversations = c),
      this.store.select(selectMessageLoading).pipe(takeUntil(this.destroy$)).subscribe(l => this.loading = l),
      this.store.select(selectMyTrainers).pipe(takeUntil(this.destroy$)).subscribe(t => this.myTrainers = t),
      this.store.select(selectMyConnections).pipe(takeUntil(this.destroy$)).subscribe(c => this.connections = c),
      this.store.select(selectActiveConversationUserId).pipe(takeUntil(this.destroy$)).subscribe(id => this.activeUserId = id),
      this.store.select(selectActiveConversationMessages).pipe(takeUntil(this.destroy$)).subscribe(m => this.activeMessages = m),
      this.store.select(selectLoadingConversation).pipe(takeUntil(this.destroy$)).subscribe(l => this.loadingConversation = l),
      this.store.select(selectIsActivePartyTyping).pipe(takeUntil(this.destroy$)).subscribe(t => this.activePartyTyping = t),
      this.store.select(selectMessageError).pipe(takeUntil(this.destroy$)).subscribe(error => {
        if (error) this.snackBar.openSnackBar(error || genericError, 'error');
      }),
    );

    // Deep link from a "Message" button elsewhere in the app
    // (?userId=<otherUserId>) -- open that thread straight away rather than
    // making the user hunt for the person in the list again.
    const requestedUserId = Number(this.route.snapshot.queryParamMap.get('userId'));
    if (requestedUserId > 0) {
      this.openConversation(requestedUserId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.forEach(s => s.unsubscribe());
    this.store.dispatch(MessageActions.clearActiveConversation());
  }

  /** Booked trainers + accepted connections who don't already have a conversation started, deduped by userId. */
  get startableContacts(): StartableContact[] {
    const existingIds = new Set(this.conversations.map(c => c.otherUserId));

    const fromTrainers: StartableContact[] = this.myTrainers
      .filter(t => t.type === 'trainer' && t.userId != null && !existingIds.has(t.userId))
      .map(t => ({ userId: t.userId as number, name: t.name }));

    const fromConnections: StartableContact[] = this.connections
      .filter(c => !existingIds.has(c.otherUserId))
      .map(c => ({ userId: c.otherUserId, name: c.otherUserName }));

    const seen = new Set<number>();
    return [...fromTrainers, ...fromConnections].filter(c => {
      if (seen.has(c.userId)) return false;
      seen.add(c.userId);
      return true;
    });
  }

  /** The open thread's other party, as a display row -- from the conversation list, else the startable-contacts list. */
  get activeContact(): ConversationRowData & { role: string } {
    const convo = this.conversations.find(c => c.otherUserId === this.activeUserId);
    if (convo) {
      return { userId: convo.otherUserId, name: convo.otherUserName, photo: convo.otherUserPhoto, role: convo.otherUserRole };
    }
    const contact = this.startableContacts.find(c => c.userId === this.activeUserId);
    return { userId: this.activeUserId ?? 0, name: contact?.name ?? 'Conversation', role: '' };
  }

  refresh(): void {
    this.store.dispatch(MessageActions.loadConversations());
    this.store.dispatch(loadMyTrainers());
    this.store.dispatch(loadMyConnections());
    if (this.activeUserId != null) {
      this.store.dispatch(MessageActions.loadConversation({ otherUserId: this.activeUserId }));
    }
  }

  openConversation(otherUserId: number): void {
    this.store.dispatch(MessageActions.loadConversation({ otherUserId }));
    this.store.dispatch(MessageActions.markConversationRead({ otherUserId }));
    // A reply/edit in progress in one thread makes no sense once you switch
    // to a different one -- the target message wouldn't even be on screen.
    this.replyTo = null;
    this.editingMessage = null;
  }

  /**
   * Starting a brand-new thread is just opening a conversation that happens to
   * have zero messages yet -- loadConversation() already handles that (an
   * empty array back from the server, no error) and correctly sets the
   * store's activeConversationUserId. This used to set only the component's
   * OWN local activeUserId field and dispatch clearActiveConversation()
   * instead, leaving the store's activeConversationUserId untouched -- which
   * silently broke sending the first message: sendMessageSuccess's reducer
   * only appends to activeConversationMessages when the STORE's
   * activeConversationUserId matches the sent message's recipientId, so the
   * message posted fine but never appeared in the sender's own thread.
   */
  startConversation(contact: StartableContact): void {
    this.openConversation(contact.userId);
  }

  send(payload: ComposerSendPayload): void {
    if (this.activeUserId == null) return;
    this.store.dispatch(MessageActions.sendMessage({
      request: { recipientId: this.activeUserId, body: payload.body, replyToMessageId: payload.replyToMessageId }
    }));
  }

  setTyping(typing: boolean): void {
    if (this.activeUserId == null) return;
    this.store.dispatch(MessageActions.setTyping({ otherUserId: this.activeUserId, typing }));
  }

  startReply(message: Message): void {
    this.editingMessage = null;
    this.replyTo = message;
  }

  cancelReply(): void {
    this.replyTo = null;
  }

  startEdit(message: Message): void {
    this.replyTo = null;
    this.editingMessage = message;
  }

  cancelEdit(): void {
    this.editingMessage = null;
  }

  saveEdit(payload: { messageId: number; body: string }): void {
    this.editingMessage = null;
    this.store.dispatch(MessageActions.editMessage({
      messageId: payload.messageId,
      request: { recipientId: this.activeUserId ?? 0, body: payload.body }
    }));
  }

  /** Unsending is irreversible and easy to hit by accident on a hover action -- confirm first. */
  unsend(messageId: number): void {
    const dialogRef = this.dialog.open(PromptModalComponent, {
      data: {
        message: 'unsend this message? Everyone in the conversation will see "Message unsent" instead.',
        confirmation: true,
        disableClose: true,
      },
    });

    dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.store.dispatch(MessageActions.deleteMessage({ messageId }));
      dialogRef.close();
    });
  }

  isMine(message: Message): boolean {
    return message.senderId !== this.activeUserId;
  }

  /** The id of the sender's own most recent message in the open thread -- drives the "Seen" receipt. */
  get lastMineMessageId(): number | null {
    for (let i = this.activeMessages.length - 1; i >= 0; i--) {
      if (this.isMine(this.activeMessages[i])) return this.activeMessages[i].id;
    }
    return null;
  }
}
