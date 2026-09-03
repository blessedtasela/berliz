import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
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
  selectIsActivePartyTyping,
  selectLoadingConversation,
  selectMessageError,
  selectTotalUnreadCount,
} from 'src/app/state/message/message.selectors';
import { ConversationRowData } from 'src/app/messages/shared/conversation-row/conversation-row.component';

import { loadMyTrainers } from 'src/app/state/booking/booking.actions';
import { selectMyTrainers } from 'src/app/state/booking/booking.selectors';

import { loadMyConnections } from 'src/app/state/connection/connection.actions';
import { selectMyConnections } from 'src/app/state/connection/connection.selectors';
import { Connection } from 'src/app/models/connection.model';

import { selectUser } from 'src/app/state/user/user.selector';

import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';

/** A person you can start (or already have) a conversation with -- either a booked trainer or an accepted Connection. */
interface StartableContact {
  userId: number;
  name: string;
}

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

  // Mirrors ScrollToTopComponent's own show threshold (no shared state between
  // the two -- they're independent siblings mounted in different places) so the
  // bubble/panel can lift out of the way once that button appears in the same corner.
  raised = false;

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.raised = window.scrollY > 2000;
  }

  conversations: ConversationSummary[] = [];
  unreadCount = 0;
  myTrainers: MyTrainerSummary[] = [];
  connections: Connection[] = [];

  activeUserId: number | null = null;
  activeMessages: Message[] = [];
  loadingConversation = false;
  activePartyTyping = false;

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
    this.store.dispatch(loadMyConnections());

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
      this.store.select(selectMyConnections).pipe(takeUntil(this.destroy$)).subscribe(c => this.connections = c),
      this.store.select(selectActiveConversationUserId).pipe(takeUntil(this.destroy$)).subscribe(id => this.activeUserId = id),
      this.store.select(selectActiveConversationMessages).pipe(takeUntil(this.destroy$)).subscribe(m => this.activeMessages = m),
      this.store.select(selectLoadingConversation).pipe(takeUntil(this.destroy$)).subscribe(l => this.loadingConversation = l),
      this.store.select(selectIsActivePartyTyping).pipe(takeUntil(this.destroy$)).subscribe(t => this.activePartyTyping = t),
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

  /**
   * Starting a brand-new thread is just opening a conversation that happens to
   * have zero messages yet -- see messages-main.component.ts's startConversation
   * for the full explanation of the bug this replaced (only the component's
   * own local activeUserId was set, never the store's activeConversationUserId,
   * so a first message posted successfully but never appeared in the sender's
   * own thread).
   */
  startConversation(contact: StartableContact): void {
    this.openConversation(contact.userId);
  }

  backToList(): void {
    this.view = 'list';
  }

  send(body: string): void {
    if (this.activeUserId == null) return;
    this.store.dispatch(MessageActions.sendMessage({
      request: { recipientId: this.activeUserId, body }
    }));
  }

  setTyping(typing: boolean): void {
    if (this.activeUserId == null) return;
    this.store.dispatch(MessageActions.setTyping({ otherUserId: this.activeUserId, typing }));
  }

  unsend(messageId: number): void {
    this.store.dispatch(MessageActions.deleteMessage({ messageId }));
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

  /** The open thread's other party, as a display row -- from the conversation list, else the startable-contacts list. */
  get activeContact(): ConversationRowData & { role: string } {
    const convo = this.conversations.find(c => c.otherUserId === this.activeUserId);
    if (convo) {
      return { userId: convo.otherUserId, name: convo.otherUserName, photo: convo.otherUserPhoto, role: convo.otherUserRole };
    }
    const contact = this.startableContacts.find(c => c.userId === this.activeUserId);
    return { userId: this.activeUserId ?? 0, name: contact?.name ?? 'Conversation', role: '' };
  }

  goToFullPage(): void {
    this.open = false;
    this.router.navigate(['/dashboard/messages']);
  }
}
