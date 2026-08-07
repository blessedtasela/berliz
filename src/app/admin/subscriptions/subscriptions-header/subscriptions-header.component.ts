import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { AddSubscriptionsModalComponent } from '../add-subscriptions-modal/add-subscriptions-modal.component';
import { Store } from '@ngrx/store';
import { loadSubscriptions } from 'src/app/state/subscription/subscription.actions';
import { selectSubscriptions } from 'src/app/state/subscription/subscription.selectors';

@Component({
  selector: 'app-subscriptions-header',
  templateUrl: './subscriptions-header.component.html',
  styleUrls: ['./subscriptions-header.component.css']
})
export class SubscriptionsHeaderComponent {
  responseMessage: any;
  showFullData: boolean = false;
  selectedSortOption: string = 'date';
  @Input() subscriptionsData: Subscriptions[] = [];
  @Input() totalSubscriptions: number = 0;
  @Input() subscriptionsLength: number = 0;

  constructor(private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
    private store: Store,
    private rxStompService: RxStompService) {
  }

  ngOnInit() {
    this.watchDeleteSubscription()
    this.watchGetSubscriptionFromMap()
  }

  handleEmitEvent() {
    this.ngxService.start()
    this.store.dispatch(loadSubscriptions());
    this.store.select(selectSubscriptions).subscribe((allSubscriptions) => {
      this.subscriptionsData = allSubscriptions;
      this.totalSubscriptions = this.subscriptionsData.length
      this.subscriptionsLength = this.subscriptionsData.length
      this.ngxService.stop()
    });
  }

  sortCategoriesData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.subscriptionsData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case 'email':
        this.subscriptionsData.sort((a, b) => {
          return a.user.email.localeCompare(b.user.email);
        });
        break;
      case 'id':
        this.subscriptionsData.sort((a, b) => {
          return a.id - b.id;
        });
        break;
      case 'lastUpdate':
        this.subscriptionsData.sort((a, b) => {
          const dateA = new Date(a.lastUpdate);
          const dateB = new Date(b.lastUpdate);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      default:
        break;
    }
  }

  onSortOptionChange(event: any) {
    this.selectedSortOption = event.target.value;
    this.sortCategoriesData();
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }

  openAddCategory() {
    const dialogRef = this.dialog.open(AddSubscriptionsModalComponent, {
      width: '800px',
      maxWidth: '95vw',
      panelClass: 'mat-dialog-height',
      disableClose: true,
    });
    const childComponentInstance = dialogRef.componentInstance as AddSubscriptionsModalComponent;
    childComponentInstance.onAddSubscriptionEmit.subscribe(() => {
      this.handleEmitEvent()
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without adding a subscription');
      }
    });
  }

  watchDeleteSubscription() {
    this.rxStompService.watch('/topic/deleteSubscription').subscribe(() => {
      this.handleEmitEvent();
    });
  }

  watchGetSubscriptionFromMap() {
    this.rxStompService.watch('/topic/getSubscriptionFromMap').subscribe(() => {
      this.handleEmitEvent();
    });
  }
}
