import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject, filter, takeUntil } from 'rxjs';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { selectUser } from 'src/app/state/user/user.selector';
import { loadMySubscriptions } from 'src/app/state/subscription/subscription.actions';
import { selectMySubscriptions } from 'src/app/state/subscription/subscription.selectors';

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
    private store: Store,
    private rxStomp: RxStompService,
    private loader: NgxUiLoaderService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {


    this.isAdmin = this.authService.isAdmin();

    // Wait until user is loaded before fetching subscriptions
    this.store.select(selectUser)
      .subscribe(() => {
        this.loadSubscriptions();

      });
  }

  private loadSubscriptions() {
    this.store.dispatch(loadMySubscriptions());
    this.store.select(selectMySubscriptions)
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

}
