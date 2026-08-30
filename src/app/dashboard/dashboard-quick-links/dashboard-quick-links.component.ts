import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { loadConversations } from 'src/app/state/message/message.actions';
import { selectTotalUnreadCount } from 'src/app/state/message/message.selectors';
import { loadPendingRequests } from 'src/app/state/connection/connection.actions';
import { selectIncomingRequestCount } from 'src/app/state/connection/connection.selectors';

interface QuickLink {
  name: string;
  icon: string;
  route: string;
  description: string;
  /** Optional live badge count -- set at render time from the fields below, not here. */
  badgeKey?: 'unreadMessages' | 'incomingConnections';
}

/**
 * "More on Berliz" -- the Overview page had no representation at all for
 * Messages, Timeline, Connections, Members, My Progress, or FAQs, even though
 * every one of them is a first-class item in the sidebar (see
 * SIDEBAR_NAV_ITEMS). Icons are deliberately kept in sync with that list so
 * the same entity always reads the same way across the dashboard shell.
 */
@Component({
  selector: 'app-dashboard-quick-links',
  templateUrl: './dashboard-quick-links.component.html',
  styleUrls: ['./dashboard-quick-links.component.css']
})
export class DashboardQuickLinksComponent implements OnInit, OnDestroy {

  unreadMessages = 0;
  incomingConnections = 0;

  readonly links: QuickLink[] = [
    { name: 'Messages', icon: 'message-circle', route: '/dashboard/messages', description: 'Chat with your trainers and connections', badgeKey: 'unreadMessages' },
    { name: 'Connections', icon: 'users', route: '/dashboard/connections', description: 'Requests and people you’re connected with', badgeKey: 'incomingConnections' },
    { name: 'Timeline', icon: 'file-text', route: '/dashboard/timeline', description: 'Posts from you and your connections' },
    { name: 'Members', icon: 'grid', route: '/dashboard/member-directory', description: 'Find and connect with other members' },
    { name: 'My Progress', icon: 'trending-up', route: '/dashboard/my-progress', description: 'Track how your training is going' },
    { name: 'FAQs', icon: 'message-square', route: '/dashboard/my-faqs', description: 'Answers to common questions' },
  ];

  private subscriptions: Subscription[] = [];

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.store.dispatch(loadConversations());
    this.store.dispatch(loadPendingRequests());

    this.subscriptions.push(
      this.store.select(selectTotalUnreadCount).subscribe(count => this.unreadMessages = count),
      this.store.select(selectIncomingRequestCount).subscribe(count => this.incomingConnections = count),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  badgeFor(link: QuickLink): number {
    if (!link.badgeKey) return 0;
    return this[link.badgeKey];
  }
}
