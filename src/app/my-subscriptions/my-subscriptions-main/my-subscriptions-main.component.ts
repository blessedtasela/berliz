import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject, filter, takeUntil } from 'rxjs';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SubscriptionStateService } from 'src/app/services/subscription-state.service';
import { UserStateService } from 'src/app/services/user-state.service';

@Component({
  selector: 'app-my-subscriptions-main',
  templateUrl: './my-subscriptions-main.component.html',
  styleUrls: ['./my-subscriptions-main.component.css']
})
export class MySubscriptionsMainComponent implements OnInit, OnDestroy {
  subscriptionsList: Subscriptions[] = [];
  isAdmin = false;

  private destroy$ = new Subject<void>();

  constructor(
    private subscriptionState: SubscriptionStateService,
    private userState: UserStateService,
    private rxStomp: RxStompService,
    private loader: NgxUiLoaderService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {


    this.isAdmin = this.authService.isAdmin();

    // Wait until user is loaded before fetching subscriptions
    this.userState.userData$
      .pipe(filter(u => !!u), takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadSubscriptions();
        this.registerWebsocketListeners();

      });
  }

  private loadSubscriptions() {
    this.subscriptionState.getMySubscriptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(subs => {
        this.subscriptionsList = subs;
      });
  }

  handleRefresh() {
    this.loadSubscriptions();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private registerWebsocketListeners() {
    const topics = [
      '/topic/updateSubscription',
      '/topic/getSubscriptionFromMap',
      '/topic/updateSubscriptionStatus',
      '/topic/deleteSubscription',
      '/topic/subscriptionBulkAction'
    ];

    topics.forEach(topic => {
      this.rxStomp.watch(topic)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.loadSubscriptions());
    });
  }

}
