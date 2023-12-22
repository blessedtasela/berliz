import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubscriptionStateService } from 'src/app/services/subscription-state.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { UpdateSubscriptionsModalComponent } from '../update-subscriptions-modal/update-subscriptions-modal.component';
import { SubscriptionDetailsModalComponent } from '../subscription-details-modal/subscription-details-modal.component';

@Component({
  selector: 'app-subscriptions-list',
  templateUrl: './subscriptions-list.component.html',
  styleUrls: ['./subscriptions-list.component.css']
})
export class SubscriptionsListComponent {
  responseMessage: any;
  showFullData: boolean = false;
  @Input() subscriptionsData: Subscriptions[] = [];
  @Input() totalSubscriptions: number = 0;

  constructor(private datePipe: DatePipe,
    private subscriptionService: SubscriptionService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private rxStompService: RxStompService,
    public subscriptionStateService: SubscriptionStateService) {
  }

  ngOnInit() {
    this.watchGetCategoryFromMap()
    this.watchLikeCategory()
    this.watchUpdateCategory()
    this.watchUpdateStatus()
    this.watchDeleteCategory()
  }

  handleEmitEvent() {
    this.subscriptionStateService.getAllSubscriptions().subscribe((allSubscriptions) => {
      this.ngxService.start()
      this.subscriptionsData = allSubscriptions;
      this.totalSubscriptions = this.subscriptionsData.length
      this.subscriptionStateService.setAllSubscriptionsSubject(this.subscriptionsData);
      this.ngxService.stop()
    });
  }


  openUpdateSubscription(id: number) {
    try {
      const subscription = this.subscriptionsData.find(subscription => subscription.id === id);
      if (subscription) {
        const dialogRef = this.dialog.open(UpdateSubscriptionsModalComponent, {
          width: '900px',
          maxHeight: '600px',
          disableClose: true,
          data: {
            subscriptionData: subscription,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdateSubscriptionsModalComponent;
        childComponentInstance.onUpdateSubscriptionEmit.subscribe(() => {
          this.handleEmitEvent()
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without adding a subscription');
            }
          });
        });
      } else {
        this.snackbarService.openSnackBar('subscription not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check subscription status", 'error');
    }
  }

  openSubscriptionDetails(id: number) {
    try {
      const subscription = this.subscriptionsData.find(subscription => subscription.id === id);
      if (subscription) {
        const dialogRef = this.dialog.open(SubscriptionDetailsModalComponent, {
          width: '800px',
          panelClass: 'mat-dialog-height',
          data: {
            subscriptionData: subscription,
          }
        });
      } else {
        this.snackbarService.openSnackBar('subscription not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check subscription status", 'error');
    }
  }

  updateSubscriptionStatus(id: number) {
    const dialogConfig = new MatDialogConfig();
    const subscription = this.subscriptionsData.find(subscription => subscription.id === id);
    const message = subscription?.status === 'false'
      ? 'activate this subscription?'
      : 'deactivate this subscription?';

    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.subscriptionService.updateStatus(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('subscription status updated successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without updating subscription status');
            }
          })
        })
    }, (error) => {
      this.ngxService.stop();
      this.snackbarService.openSnackBar(error, 'error');
      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, 'error');
    });
  }

  deleteSubscription(id: number) {
    const dialogConfig = new MatDialogConfig();
    const message = "delete this subscription? This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.subscriptionService.deleteSubscription(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('subscription deleted successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without deleting subscription');
            }
          })
        })
    }, (error) => {
      this.ngxService.stop();
      this.snackbarService.openSnackBar(error, 'error');
      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, 'error');
    });
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  watchLikeCategory() {
    this.rxStompService.watch('/topic/likeCategory').subscribe((message) => {
      const receivedCategories: Subscriptions = JSON.parse(message.body);
      const categoryId = this.subscriptionsData.findIndex(subscription => subscription.id === receivedCategories.id)
      this.subscriptionsData[categoryId] = receivedCategories
    });
  }

  watchUpdateCategory() {
    this.rxStompService.watch('/topic/updateCategory').subscribe((message) => {
      const receivedCategories: Subscriptions = JSON.parse(message.body);
      const categoryId = this.subscriptionsData.findIndex(subscription => subscription.id === receivedCategories.id)
      this.subscriptionsData[categoryId] = receivedCategories
    });
  }

  watchGetCategoryFromMap() {
    this.rxStompService.watch('/topic/getCategoryFromMap').subscribe((message) => {
      const receivedCategories: Subscriptions = JSON.parse(message.body);
      this.subscriptionsData.push(receivedCategories);
    });
  }

  watchUpdateStatus() {
    this.rxStompService.watch('/topic/updateCategoryStatus').subscribe((message) => {
      const receivedCategories: Subscriptions = JSON.parse(message.body);
      const categoryId = this.subscriptionsData.findIndex(subscription => subscription.id === receivedCategories.id)
      this.subscriptionsData[categoryId] = receivedCategories
    });
  }

  watchDeleteCategory() {
    this.rxStompService.watch('/topic/deleteCategory').subscribe((message) => {
      const receivedCategories: Subscriptions = JSON.parse(message.body);
      this.subscriptionsData = this.subscriptionsData.filter(subscription => subscription.id !== receivedCategories.id);
    });
  }

}

