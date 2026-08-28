import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, Subscription, takeUntil } from 'rxjs';

import { ConversationSummary, Message } from 'src/app/models/message.model';
import { MyTrainerSummary } from 'src/app/models/progress-share.model';

import * as MessageActions from 'src/app/state/message/message.actions';
import {
  selectActiveConversationMessages,
  selectActiveConversationUserId,
  selectConversations,
  selectLoadingConversation,
  selectMessageError,
  selectMessageLoading,
} from 'src/app/state/message/message.selectors';

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

  draftBody = '';

  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private snackBar: SnackBarService,
    public lightbox: PhotoLightboxService,
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
      this.store.select(selectMessageError).pipe(takeUntil(this.destroy$)).subscribe(error => {
        if (error) this.snackBar.openSnackBar(error || genericError, 'error');
      }),
    );
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

  openConversation(otherUserId: number): void {
    this.store.dispatch(MessageActions.loadConversation({ otherUserId }));
    this.store.dispatch(MessageActions.markConversationRead({ otherUserId }));
  }

  startConversation(contact: StartableContact): void {
    this.activeUserId = contact.userId;
    this.store.dispatch(MessageActions.clearActiveConversation());
  }

  send(): void {
    const body = this.draftBody.trim();
    if (!body || this.activeUserId == null) return;

    this.store.dispatch(MessageActions.sendMessage({
      request: { recipientId: this.activeUserId, body }
    }));
    this.draftBody = '';
  }

  isMine(message: Message): boolean {
    return message.senderId !== this.activeUserId;
  }

  /** Conversation list only ever rendered a static icon -- ConversationSummaryResponse had no photo field until now. */
  photoSrc(c: ConversationSummary): string | null {
    return c.otherUserPhoto ? 'data:image/*;base64,' + c.otherUserPhoto : null;
  }
}
