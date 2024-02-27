import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SubscriptionStateService } from 'src/app/services/subscription-state.service';

@Component({
  selector: 'app-my-subscriptions-page',
  templateUrl: './my-subscriptions-page.component.html',
  styleUrls: ['./my-subscriptions-page.component.css']
})
export class MySubscriptionsPageComponent {
  mySubscriptions: Subscriptions[] = [];
  totalSubscriptions: number = 0;
  subscriptionsLength: number = 0;
  allmySubscriptions: Subscriptions[] = [];
  alltotalSubscriptions: number = 0;
  allsubscriptionsLength: number = 0;
  searchComponent: string = 'mySubscription';
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];
  isAdmin: boolean = false;

  constructor(private ngxService: NgxUiLoaderService,
    private subscriptionStateService: SubscriptionStateService,
    private authService: AuthenticationService,
    private rxStompService: RxStompService) {
  }

  ngOnInit(): void {
    this.ngxService.start()
    this.handleEmitEvent()
    this.isAdmin = this.authService.isAdmin()
    this.watchUpdateSubscription()
    this.watchGetSubscriptionFromMap()
    this.watchUpdateSubscriptionStatus()
    this.watchDeleteSubscription()
    this.watchSubscriptionBulkAction()
    this.ngxService.stop()
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => (subscription.unsubscribe()));
  }

  handleEmitEvent() {
    this.subscriptions.push(
      this.subscriptionStateService.getMySubscriptions().subscribe((mySubscriptions) => {
        console.log('isCachedData false')
        this.mySubscriptions = mySubscriptions;
        this.totalSubscriptions = mySubscriptions.length
        this.subscriptionsLength = mySubscriptions.length
        this.subscriptionStateService.setMySubscriptionsSubject(mySubscriptions);
      }),
    );
  }

  handleSearchResults(results: Subscriptions[]): void {
    this.mySubscriptions = results;
    this.totalSubscriptions = results.length;
  }

  emitData() {
    this.handleEmitEvent();
  }

  watchGetSubscriptionFromMap() {
    this.rxStompService.watch('/topic/getSubscriptionFromMap').subscribe((message) => {
      this.handleEmitEvent();
    });
  }

  watchUpdateSubscription() {
    this.rxStompService.watch('/topic/updateSubscription').subscribe((message) => {
      this.handleEmitEvent();
    });
  }

  watchDeleteSubscription() {
    this.rxStompService.watch('/topic/deleteSubscription').subscribe((message) => {
      this.handleEmitEvent();
    });
  }

  watchUpdateSubscriptionStatus() {
    this.rxStompService.watch('/topic/updateSubscriptionStatus').subscribe((message) => {
      this.handleEmitEvent();
    });
  }

  watchSubscriptionBulkAction() {
    this.rxStompService.watch('/topic/subscriptionBulkAction').subscribe((message) => {
      this.handleEmitEvent();
    });
  }

  watchn() {
    this.rxStompService.watch('/topic/deleteSubscription').subscribe((message) => {
      this.handleEmitEvent();
      // const receivedNewsletter: Subscriptions = JSON.parse(message.body);
      // this.mySubscriptions = this.mySubscriptions.filter(Subscription => Subscription.id !== receivedNewsletter.id);
      // this.totalSubscriptions = this.mySubscriptions.length;
    });
  }

}