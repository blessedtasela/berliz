import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';

import { ConversationSummary, Message } from 'src/app/models/message.model';
import { MyTrainerSummary } from 'src/app/models/progress-share.model';

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

import { selectUser } from 'src/app/state/user/user.selector';

import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';

/**
 * Floating chat bubble mounted once at the app root (see app.component.html) so it
 * persists across route navigation. Reuses the exact same state/message NgRx slice
 * as MessagesMainComponent (the full-page center at /dashboard/messages) -- this is
 * a second, compact UI surface over the same data, not a second messaging feature.
 *
 * Hidden in two cases: the user turned the popup off in Settings
 * (user.messagePopupEnabled === false), or they're already on the full-page center,
 * which would otherwise stack a redundant second chat UI on screen and fight over
 * the same shared "active conversation" state (the full page clears it on destroy).
 */
@Component({
  selector: 'app-message-popup',
  templateUrl: './message-popup.component.html',
  styleUrls: ['./message-popup.component.css']
})
export class MessagePopupComponent implements OnInit, OnDestroy {

  popupEnabled = true;
  onMessagesPage = false;

  open = false;
  view: 'list' | 'thread' = 'list';

  conversations: ConversationSummary[] = [];
  unreadCount = 0;
  myTrainers: MyTrainerSummary[] = [];

  activeUserId: number | null = null;
  activeMessages: Message[] = [];
  loadingConversation = false;

  draftBody = '';

  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private router: Router,
    private snackBar: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.store.dispatch(MessageActions.loadConversations());
    this.store.dispatch(loadMyTrainers());

    this.onMessagesPage = this.router.url.startsWith('/dashboard/messages');

    this.subscriptions.push(
      this.router.events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      ).subscribe(e => this.onMessagesPage = e.urlAfterRedirects.startsWith('/dashboard/messages')),

      this.store.select(selectUser).pipe(takeUntil(this.destroy$))
        .subscribe(user => this.popupEnabled = user?.messagePopupEnabled !== false),

      this.store.select(selectConversations).pipe(takeUntil(this.destroy$)).subscribe(c => this.conversations = c),
      this.store.select(selectTotalUnreadCount).pipe(takeUntil(this.destroy$)).subscribe(n => this.unreadCount = n),
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
  }

  /** Trainers from myTrainers who don't already have a conversation started. */
  get startableTrainers(): MyTrainerSummary[] {
    const existingIds = new Set(this.conversations.map(c => c.otherUserId));
    return this.myTrainers.filter(t => t.type === 'trainer' && t.userId != null && !existingIds.has(t.userId));
  }

  togglePopup(): void {
    this.open = !this.open;
  }

  /** The small X in the panel header -- closes for this session only, does not touch the Settings preference. */
  closePopup(): void {
    this.open = false;
  }

  openConversation(otherUserId: number): void {
    this.store.dispatch(MessageActions.loadConversation({ otherUserId }));
    this.store.dispatch(MessageActions.markConversationRead({ otherUserId }));
    this.view = 'thread';
  }

  startConversation(trainer: MyTrainerSummary): void {
    if (trainer.userId == null) return;
    this.activeUserId = trainer.userId;
    this.store.dispatch(MessageActions.clearActiveConversation());
    this.view = 'thread';
  }

  backToList(): void {
    this.view = 'list';
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

  goToFullPage(): void {
    this.open = false;
    this.router.navigate(['/dashboard/messages']);
  }
}
