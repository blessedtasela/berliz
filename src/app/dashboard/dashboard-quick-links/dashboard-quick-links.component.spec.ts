import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { DashboardQuickLinksComponent } from './dashboard-quick-links.component';
import * as MessageActions from 'src/app/state/message/message.actions';
import { selectTotalUnreadCount } from 'src/app/state/message/message.selectors';
import * as ConnectionActions from 'src/app/state/connection/connection.actions';
import { selectIncomingRequestCount } from 'src/app/state/connection/connection.selectors';

describe('DashboardQuickLinksComponent', () => {
  let component: DashboardQuickLinksComponent;
  let fixture: ComponentFixture<DashboardQuickLinksComponent>;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardQuickLinksComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectTotalUnreadCount, value: 3 },
            { selector: selectIncomingRequestCount, value: 2 },
          ]
        })
      ]
    });

    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callThrough();

    fixture = TestBed.createComponent(DashboardQuickLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads conversations and pending requests so the badge counts are live', () => {
    expect(store.dispatch).toHaveBeenCalledWith(MessageActions.loadConversations());
    expect(store.dispatch).toHaveBeenCalledWith(ConnectionActions.loadPendingRequests());
  });

  it('surfaces live unread/pending counts on the right link cards', () => {
    expect(component.unreadMessages).toBe(3);
    expect(component.incomingConnections).toBe(2);

    const messages = component.links.find(l => l.name === 'Messages')!;
    const connections = component.links.find(l => l.name === 'Connections')!;
    const timeline = component.links.find(l => l.name === 'Timeline')!;

    expect(component.badgeFor(messages)).toBe(3);
    expect(component.badgeFor(connections)).toBe(2);
    expect(component.badgeFor(timeline)).toBe(0);
  });

  it('lists every entity missing from the Overview page', () => {
    const routes = component.links.map(l => l.route);
    expect(routes).toEqual(jasmine.arrayContaining([
      '/dashboard/messages',
      '/dashboard/connections',
      '/dashboard/timeline',
      '/dashboard/member-directory',
      '/dashboard/my-progress',
      '/dashboard/my-faqs',
    ]));
  });
});
