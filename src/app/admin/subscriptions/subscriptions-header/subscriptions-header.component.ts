import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { SubscriptionStateService } from 'src/app/services/subscription-state.service';
import { AddSubscriptionsModalComponent } from '../add-subscriptions-modal/add-subscriptions-modal.component';

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
    private subscriptionStateService: SubscriptionStateService,
    private rxStompService: RxStompService) {
  }

  ngOnInit() {
    this.watchDeleteCategory()
    this.watchGetCategoryFromMap()
  }

  handleEmitEvent() {
    this.subscriptionStateService.getAllSubscriptions().subscribe((allSubscriptions) => {
      this.ngxService.start()
      console.log('cached false')
      this.subscriptionsData = allSubscriptions;
      this.totalSubscriptions = this.subscriptionsData.length
      this.subscriptionsLength = this.subscriptionsData.length
      this.subscriptionStateService.setAllSubscriptionsSubject(this.subscriptionsData);
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

  watchDeleteCategory() {
    this.rxStompService.watch('/topic/deleteCenter').subscribe((message) => {
      const receivedCategories: Subscriptions = JSON.parse(message.body);
      this.subscriptionsData = this.subscriptionsData.filter(subscription => subscription.id !== receivedCategories.id);
      this.subscriptionsLength = this.subscriptionsData.length;
      this.totalSubscriptions = this.subscriptionsData.length
    });
  }

  watchGetCategoryFromMap() {
    this.rxStompService.watch('/topic/getCategoryFromMap').subscribe((message) => {
      const receivedCategories: Subscriptions = JSON.parse(message.body);
      this.subscriptionsData.push(receivedCategories);
      this.subscriptionsLength = this.subscriptionsData.length;
      this.totalSubscriptions = this.subscriptionsData.length
    });
  }
}
