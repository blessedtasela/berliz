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

import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';

/**
 * Conversation list + thread view. New conversations start from the
 * client's own "my trainers" list (already fetched for progress-sharing) --
 * a trainer replies to whatever a client has already started rather than
 * having their own picker, matching how coaching-platform messaging
 * naturally starts (client reaches out first). A trainer-side "my clients"
 * picker is a natural follow-up once that list exists as its own feature.
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

  activeUserId: number | null = null;
  activeMessages: Message[] = [];
  loadingConversation = false;

  draftBody = '';

  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private snackBar: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.store.dispatch(MessageActions.loadConversations());
    this.store.dispatch(loadMyTrainers());

    this.subscriptions.push(
      this.store.select(selectConversations).pipe(takeUntil(this.destroy$)).subscribe(c => this.conversations = c),
      this.store.select(selectMessageLoading).pipe(takeUntil(this.destroy$)).subscribe(l => this.loading = l),
      this.store.select(selectMyTrainers).pipe(takeUntil(this.destroy$)).subscribe(t => this.myTrainers = t),
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

  /** Trainers from myTrainers who don't already have a conversation started. */
  get startableTrainers(): MyTrainerSummary[] {
    const existingIds = new Set(this.conversations.map(c => c.otherUserId));
    return this.myTrainers.filter(t => t.type === 'trainer' && t.userId != null && !existingIds.has(t.userId));
  }

  openConversation(otherUserId: number): void {
    this.store.dispatch(MessageActions.loadConversation({ otherUserId }));
    this.store.dispatch(MessageActions.markConversationRead({ otherUserId }));
  }

  startConversation(trainer: MyTrainerSummary): void {
    if (trainer.userId == null) return;
    this.activeUserId = trainer.userId;
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
}
