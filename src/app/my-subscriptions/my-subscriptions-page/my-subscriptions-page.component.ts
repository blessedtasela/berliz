import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, filter, takeUntil } from 'rxjs';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { SubscriptionStateService } from 'src/app/services/subscription-state.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-my-subscriptions-page',
  templateUrl: './my-subscriptions-page.component.html',
  styleUrls: ['./my-subscriptions-page.component.css']
})
export class MySubscriptionsPageComponent  {
  
}
